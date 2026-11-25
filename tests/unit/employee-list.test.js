import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addEmployee,
  getEmployees,
  removeEmployee,
} from '../../src/js/employee-store.js';
import { initializeEmployeeList } from '../../src/js/employee-list.js';

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

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Employee list', () => {
  it('should show the empty state when no employees are registered', () => {
    const container = new ElementStub();
    vi.stubGlobal('document', {
      createElement: (tagName) => Object.assign(new ElementStub(), { tagName }),
      querySelector: (selector) =>
        selector === '#employee-list-content' ? container : null,
    });

    const unsubscribe = initializeEmployeeList();

    expect(getRenderedText(container)).toContain('Nenhum colaborador cadastrado.');
    unsubscribe();
  });

  it('should render existing employees and update immediately after store changes', () => {
    const container = new ElementStub();
    vi.stubGlobal('document', {
      createElement: (tagName) => Object.assign(new ElementStub(), { tagName }),
      querySelector: (selector) =>
        selector === '#employee-list-content' ? container : null,
    });

    const existingId = `employee-list-existing-${Date.now()}`;
    const employeeId = `employee-list-${Date.now()}`;
    const email = `${employeeId}@staffpulse.com`;
    addEmployee({
      id: existingId,
      name: 'Colaborador existente',
      email: `${existingId}@staffpulse.com`,
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
      querySelector: () => null,
    });

    expect(() => initializeEmployeeList()).toThrow(
      'A estrutura da listagem de colaboradores está incompleta.'
    );
  });
});
