import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addEmployee,
  editEmployee,
  getEmployees,
  removeEmployee,
} from '../../src/js/employee-store.js';
import * as employeeStore from '../../src/js/employee-store.js';
import {
  getVisibleEmployees,
  initializeEmployeeList,
} from '../../src/js/employee-list.js';
import { ALLOWED_DEPARTMENTS, ALLOWED_STATUSES } from '../../src/js/validators.js';
import { initializeNotifications } from '../../src/js/notifications.js';

class ElementStub {
  constructor() {
    this.attributes = {};
    this.children = [];
    this.dataset = {};
    this.listeners = new Map();
    this.textContent = '';
  }

  addEventListener(eventName, listener) {
    this.listeners.set(eventName, listener);
  }

  focus() {
    this.focused = true;
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
    this.options = children;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.listeners.get('close')?.();
  }
}

function getRenderedText(element) {
  return [element.textContent, ...element.children.map(getRenderedText)].join(' ');
}

function findElements(element, tagName) {
  return [
    ...(element.tagName === tagName ? [element] : []),
    ...element.children.flatMap((child) => findElements(child, tagName)),
  ];
}

function setupListElements() {
  const elements = {
    '#employee-list-content': new ElementStub(),
    '#employee-search': new ElementStub(),
    '#employee-search-clear': new ElementStub(),
    '#employee-department-filter': new ElementStub(),
    '#employee-status-filter': new ElementStub(),
    '#employee-filters-clear': new ElementStub(),
    '#employee-sort-field': new ElementStub(),
    '#employee-sort-order': new ElementStub(),
    '#employee-details-dialog': new ElementStub(),
    '#employee-details-content': new ElementStub(),
    '#employee-details-close': new ElementStub(),
    '#notification-region': new ElementStub(),
    '#employee-operation-dialog': new ElementStub(),
    '#employee-operation-title': new ElementStub(),
    '#employee-operation-description': new ElementStub(),
    '#employee-operation-cancel': new ElementStub(),
    '#employee-operation-confirm': new ElementStub(),
  };
  elements['#employee-search'].value = '';
  elements['#employee-department-filter'].value = '';
  elements['#employee-status-filter'].value = '';
  elements['#employee-sort-field'].value = 'name';
  elements['#employee-sort-field'].options = ['name', 'salary', 'admissionDate'].map((value) => ({
    value,
  }));
  elements['#employee-sort-order'].value = 'asc';
  elements['#notification-region'].hidden = true;
  elements['#employee-operation-confirm'].disabled = false;
  initializeNotifications(elements['#notification-region']);
  return elements;
}

function stubListDocument(elements) {
  vi.stubGlobal('document', {
    createElement: (tagName) => Object.assign(new ElementStub(), { tagName }),
    querySelector: (selector) => elements[selector] ?? null,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Employee list', () => {
  it('should show the empty state when no employees are registered', () => {
    const elements = setupListElements();
    stubListDocument(elements);

    const unsubscribe = initializeEmployeeList();

    expect(getRenderedText(elements['#employee-list-content'])).toContain(
      'Nenhum colaborador cadastrado.'
    );
    unsubscribe();
  });

  it('should search dynamically, compose domain filters, and restore all rows when cleared', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    const searchInput = elements['#employee-search'];
    const clearButton = elements['#employee-search-clear'];
    stubListDocument(elements);

    const firstId = `employee-search-carlos-${Date.now()}`;
    const secondId = `employee-search-amanda-${Date.now()}`;
    const firstEmail = `${firstId}@staffpulse.com`;
    const secondEmail = `${secondId}@staffpulse.com`;
    addEmployee({
      id: firstId,
      name: 'Carlos Mendes',
      email: firstEmail,
      salary: 5200,
      admissionDate: '2021-06-15',
      department: 'RH',
    });
    addEmployee({
      id: secondId,
      name: 'Amanda Costa',
      email: secondEmail,
      salary: 6100,
      admissionDate: '2022-03-10',
      department: 'TI',
    });
    const unsubscribe = initializeEmployeeList();

    try {
      searchInput.value = 'cArLoS';
      searchInput.listeners.get('input')();
      expect(getRenderedText(container)).toContain('Carlos Mendes');
      expect(getRenderedText(container)).not.toContain('Amanda Costa');
      expect(clearButton.hidden).toBe(false);

      searchInput.value = 'nome inexistente';
      searchInput.listeners.get('input')();
      expect(getRenderedText(container)).toContain('Nenhum colaborador encontrado.');

      clearButton.listeners.get('click')();
      expect(searchInput.value).toBe('');
      expect(clearButton.hidden).toBe(true);
      expect(getRenderedText(container)).toContain('Carlos Mendes');
      expect(getRenderedText(container)).toContain('Amanda Costa');
      expect(searchInput.focused).toBe(true);

      const filtered = getVisibleEmployees(getEmployees(), 'a', { department: 'TI' });
      expect(filtered.map(({ id }) => id)).toEqual([secondId]);
    } finally {
      unsubscribe();
      for (const id of [firstId, secondId]) {
        if (getEmployees().some((employee) => employee.id === id)) {
          removeEmployee(id);
        }
      }
    }
  });

  it('should combine search and filters and sort results with the service contract', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    const searchInput = elements['#employee-search'];
    const departmentFilter = elements['#employee-department-filter'];
    const statusFilter = elements['#employee-status-filter'];
    const clearFiltersButton = elements['#employee-filters-clear'];
    const sortField = elements['#employee-sort-field'];
    const sortOrder = elements['#employee-sort-order'];
    stubListDocument(elements);

    expect(ALLOWED_DEPARTMENTS).toContain('TI');
    expect(ALLOWED_STATUSES).toEqual(['ativo', 'inativo']);
    const records = [
      {
        id: `filter-sort-1-${Date.now()}`,
        name: 'Ana Costa',
        email: `ana-costa-${Date.now()}@staffpulse.com`,
        salary: 4800,
        admissionDate: '2020-03-10',
        department: 'TI',
        status: 'ativo',
      },
      {
        id: `filter-sort-2-${Date.now()}`,
        name: 'Ana Lima',
        email: `ana-lima-${Date.now()}@staffpulse.com`,
        salary: 6200,
        admissionDate: '2022-03-10',
        department: 'TI',
        status: 'inativo',
      },
      {
        id: `filter-sort-3-${Date.now()}`,
        name: 'Ana Souza',
        email: `ana-souza-${Date.now()}@staffpulse.com`,
        salary: 5500,
        admissionDate: '2021-03-10',
        department: 'RH',
        status: 'ativo',
      },
    ];
    for (const employee of records) addEmployee(employee);
    const unsubscribe = initializeEmployeeList();

    try {
      expect(elements['#employee-department-filter'].options.map(({ value }) => value)).toEqual([
        '',
        ...ALLOWED_DEPARTMENTS,
      ]);
      expect(elements['#employee-status-filter'].options.map(({ value }) => value)).toEqual([
        '',
        ...ALLOWED_STATUSES,
      ]);
      expect(elements['#employee-sort-field'].options.map(({ value }) => value)).toEqual([
        'name',
        'salary',
        'admissionDate',
      ]);

      searchInput.value = 'aNa';
      searchInput.listeners.get('input')();
      departmentFilter.value = 'TI';
      departmentFilter.listeners.get('change')();
      statusFilter.value = 'inativo';
      statusFilter.listeners.get('change')();
      expect(clearFiltersButton.hidden).toBe(false);
      expect(getRenderedText(container)).toContain('Ana Lima');
      expect(getRenderedText(container)).not.toContain('Ana Costa');
      expect(getRenderedText(container)).not.toContain('Ana Souza');

      clearFiltersButton.listeners.get('click')();
      expect(departmentFilter.value).toBe('');
      expect(statusFilter.value).toBe('');
      expect(clearFiltersButton.hidden).toBe(true);
      expect(getRenderedText(container)).toContain('Ana Costa');
      expect(getRenderedText(container)).toContain('Ana Lima');
      expect(getRenderedText(container)).toContain('Ana Souza');

      sortField.value = 'salary';
      sortField.listeners.get('change')();
      sortOrder.value = 'desc';
      sortOrder.listeners.get('change')();
      expect(findElements(container, 'tbody')[0].children.map((row) => row.children[0].textContent))
        .toEqual(['Ana Lima', 'Ana Souza', 'Ana Costa']);
    } finally {
      unsubscribe();
      for (const { id } of records) {
        if (getEmployees().some((employee) => employee.id === id)) {
          removeEmployee(id);
        }
      }
    }
  });

  it('should retain search and filters while refreshing edited records', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    const searchInput = elements['#employee-search'];
    const departmentFilter = elements['#employee-department-filter'];
    const statusFilter = elements['#employee-status-filter'];
    const clearSearchButton = elements['#employee-search-clear'];
    stubListDocument(elements);

    const employeeId = `employee-edit-list-${Date.now()}`;
    addEmployee({
      id: employeeId,
      name: 'Paula Santos',
      email: `${employeeId}@staffpulse.com`,
      salary: 5200,
      admissionDate: '2021-06-15',
      department: 'TI',
      status: 'ativo',
    });
    const unsubscribe = initializeEmployeeList();

    try {
      searchInput.value = 'Paula Santos';
      searchInput.listeners.get('input')();
      departmentFilter.value = 'TI';
      departmentFilter.listeners.get('change')();
      statusFilter.value = 'ativo';
      statusFilter.listeners.get('change')();

      editEmployee(employeeId, { name: 'Paula Silva', salary: 7200 });

      expect(searchInput.value).toBe('Paula Santos');
      expect(departmentFilter.value).toBe('TI');
      expect(statusFilter.value).toBe('ativo');
      expect(getRenderedText(container)).toContain('Nenhum colaborador encontrado.');

      clearSearchButton.listeners.get('click')();
      expect(getRenderedText(container)).toContain('Paula Silva');
      expect(getRenderedText(container)).toContain('7.200,00');
    } finally {
      unsubscribe();
      if (getEmployees().some(({ id }) => id === employeeId)) {
        removeEmployee(employeeId);
      }
    }
  });

  it('should require confirmation before deactivating or permanently deleting an employee', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    const operationDialog = elements['#employee-operation-dialog'];
    const operationDescription = elements['#employee-operation-description'];
    const confirmButton = elements['#employee-operation-confirm'];
    const cancelButton = elements['#employee-operation-cancel'];
    const feedback = elements['#notification-region'];
    stubListDocument(elements);

    const employeeId = `employee-removal-${Date.now()}`;
    addEmployee({
      id: employeeId,
      name: 'Rita Gomes',
      email: `${employeeId}@staffpulse.com`,
      salary: 5200,
      admissionDate: '2021-06-15',
      department: 'RH',
      status: 'ativo',
    });
    const unsubscribe = initializeEmployeeList();

    const findAction = (label) =>
      findElements(container, 'button').find(
        (button) => button.getAttribute('aria-label') === label
      );

    try {
      findAction('Inativar Rita Gomes').listeners.get('click')();
      expect(operationDialog.open).toBe(true);
      expect(operationDescription.textContent).toContain('status inativo');
      expect(confirmButton.dataset.operation).toBe('inactivate');
      expect(getEmployees().find(({ id }) => id === employeeId).status).toBe('ativo');

      cancelButton.listeners.get('click')();
      expect(operationDialog.open).toBe(false);
      expect(getEmployees().find(({ id }) => id === employeeId).status).toBe('ativo');
      expect(feedback.hidden).toBe(true);

      findAction('Inativar Rita Gomes').listeners.get('click')();
      confirmButton.listeners.get('click')();
      expect(getEmployees().find(({ id }) => id === employeeId).status).toBe('inativo');
      expect(getRenderedText(container)).toContain('inativo');
      expect(findAction('Inativar Rita Gomes')).toBeUndefined();
      expect(feedback.children[0].textContent).toBe('Rita Gomes foi inativado com sucesso.');
      expect(feedback.dataset.type).toBe('success');

      findAction('Excluir permanentemente Rita Gomes').listeners.get('click')();
      operationDialog.close();
      confirmButton.listeners.get('click')();
      expect(getEmployees().some(({ id }) => id === employeeId)).toBe(true);

      findAction('Excluir permanentemente Rita Gomes').listeners.get('click')();
      expect(operationDescription.textContent).toContain('exclusão permanente');
      expect(operationDescription.textContent).toContain('não poderá ser desfeita');
      expect(getEmployees().some(({ id }) => id === employeeId)).toBe(true);

      confirmButton.listeners.get('click')();
      expect(getEmployees().some(({ id }) => id === employeeId)).toBe(false);
      expect(getRenderedText(container)).toContain('Nenhum colaborador cadastrado.');
      expect(feedback.children[0].textContent).toBe('Rita Gomes foi excluído permanentemente.');
    } finally {
      unsubscribe();
      if (getEmployees().some(({ id }) => id === employeeId)) {
        removeEmployee(employeeId);
      }
    }
  });

  it('should show removal service errors instead of success feedback', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    const confirmButton = elements['#employee-operation-confirm'];
    const feedback = elements['#notification-region'];
    stubListDocument(elements);

    const employeeId = `employee-removal-error-${Date.now()}`;
    addEmployee({
      id: employeeId,
      name: 'Rita Gomes',
      email: `${employeeId}@staffpulse.com`,
      salary: 5200,
      admissionDate: '2021-06-15',
      department: 'RH',
    });
    const unsubscribe = initializeEmployeeList();
    vi.spyOn(employeeStore, 'removeEmployee').mockImplementation(() => {
      throw new Error('Não foi possível persistir os colaboradores.');
    });

    try {
      findElements(container, 'button')
        .find((button) => button.getAttribute('aria-label') === 'Excluir permanentemente Rita Gomes')
        .listeners.get('click')();
      confirmButton.listeners.get('click')();

      expect(feedback.children[0].textContent).toBe('Não foi possível persistir os colaboradores.');
      expect(feedback.dataset.type).toBe('error');
      expect(getEmployees().some(({ id }) => id === employeeId)).toBe(true);
    } finally {
      vi.restoreAllMocks();
      unsubscribe();
      if (getEmployees().some(({ id }) => id === employeeId)) {
        removeEmployee(employeeId);
      }
    }
  });

  it('should render existing employees and update immediately after store changes', () => {
    const elements = setupListElements();
    const container = elements['#employee-list-content'];
    stubListDocument(elements);

    const existingId = `employee-list-existing-${Date.now()}`;
    const employeeId = `employee-list-${Date.now()}`;
    const email = `${employeeId}@staffpulse.com`;
    const existingEmail = `${existingId}@staffpulse.com`;
    addEmployee({
      id: existingId,
      name: 'Colaborador existente',
      email: existingEmail,
      salary: 5200,
      admissionDate: '2021-06-15',
      department: 'RH',
    });
    const unsubscribe = initializeEmployeeList();

    try {
      expect(getRenderedText(container)).toContain('Colaborador existente');

      const beforeCreate = getEmployees().length;
      addEmployee({
        id: employeeId,
        name: 'Joana Silva',
        email,
        salary: 6500,
        admissionDate: '2022-03-10',
        department: 'TI',
      });

      expect(getEmployees()).toHaveLength(beforeCreate + 1);
      expect(getRenderedText(container)).toContain('Joana Silva');
      expect(getRenderedText(container)).toContain(email);
      expect(getRenderedText(container)).toContain('6.500,00');
      expect(getRenderedText(container)).toContain('15/06/2021');
      expect(getRenderedText(container)).toContain('10/03/2022');
      expect(getRenderedText(container)).toContain('Editar');

      const headings = findElements(container, 'th').map(({ textContent }) => textContent);
      expect(headings).toEqual([
        'Nome',
        'E-mail',
        'Departamento',
        'Salário',
        'Data de admissão',
        'Status',
        'Ações',
      ]);
      const editButton = findElements(container, 'button').find(
        ({ textContent }) => textContent === 'Editar'
      );
      expect(editButton.type).toBe('button');
      expect(editButton.getAttribute('aria-label')).toBe('Editar Colaborador existente');

      const originalEmployee = getEmployees().find(({ id }) => id === existingId);
      const detailsButton = findElements(container, 'button').find(
        ({ textContent }) => textContent === 'Detalhes'
      );
      detailsButton.listeners.get('click')();
      expect(elements['#employee-details-dialog'].open).toBe(true);
      expect(getRenderedText(elements['#employee-details-content'])).toContain(existingId);
      expect(getRenderedText(elements['#employee-details-content'])).toContain(
        'Colaborador existente'
      );
      expect(getRenderedText(elements['#employee-details-content'])).toContain(
        existingEmail
      );
      expect(getRenderedText(elements['#employee-details-content'])).toContain('RH');
      expect(getRenderedText(elements['#employee-details-content'])).toContain('5.200,00');
      expect(getRenderedText(elements['#employee-details-content'])).toContain('15/06/2021');
      expect(getRenderedText(elements['#employee-details-content'])).toContain('Analista');
      expect(getRenderedText(elements['#employee-details-content'])).toContain('ativo');
      expect(getEmployees().find(({ id }) => id === existingId)).toBe(originalEmployee);
      elements['#employee-details-close'].listeners.get('click')();
      expect(elements['#employee-details-dialog'].open).toBe(false);

      removeEmployee(employeeId);
      expect(getRenderedText(container)).not.toContain('Joana Silva');
      expect(getRenderedText(container)).toContain('Colaborador existente');
    } finally {
      unsubscribe();
      for (const id of [employeeId, existingId]) {
        if (getEmployees().some((employee) => employee.id === id)) {
          removeEmployee(id);
        }
      }
    }
  });

  it('should report missing list markup', () => {
    vi.stubGlobal('document', {
      querySelector: (selector) =>
        selector === '#employee-list-content' ? new ElementStub() : null,
    });

    expect(() => initializeEmployeeList()).toThrow(
      'A estrutura de listagem e controles de colaboradores está incompleta.'
    );
  });
});
