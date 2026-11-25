import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addEmployee,
  getEmployees,
  removeEmployee,
  subscribeToEmployeeChanges,
} from '../../src/js/employee-store.js';
import * as employeeStore from '../../src/js/employee-store.js';
import { ALLOWED_DEPARTMENTS } from '../../src/js/validators.js';
import {
  initializeEmployeeForm,
  startEmployeeEdit,
} from '../../src/js/employee-form.js';

class ElementStub {
  constructor() {
    this.attributes = {};
    this.dataset = {};
    this.listeners = new Map();
    this.options = [];
    this.textContent = '';
    this.hidden = false;
  }

  addEventListener(eventName, listener) {
    this.listeners.set(eventName, listener);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  focus() {
    this.focused = true;
  }

  replaceChildren(...children) {
    this.options = children;
  }

  reset() {
    this.listeners.get('reset')();
  }
}

class FormDataStub {
  constructor(form) {
    this.form = form;
  }

  entries() {
    return Object.entries(
      Object.fromEntries(
        Object.entries(this.form.fields).map(([name, field]) => [name, field.value])
      )
    );
  }
}

function setupForm() {
  const form = new ElementStub();
  const submitButton = new ElementStub();
  submitButton.textContent = 'Cadastrar colaborador';
  submitButton.disabled = false;
  const cancelEditButton = new ElementStub();
  cancelEditButton.hidden = true;
  const title = new ElementStub();
  title.textContent = 'Novo colaborador';
  const fieldNames = ['name', 'email', 'salary', 'admissionDate', 'department'];
  const fields = Object.fromEntries(
    fieldNames.map((name) => {
      const field = new ElementStub();
      field.name = name;
      field.value = '';
      return [name, field];
    })
  );
  form.fields = fields;
  const errors = Object.fromEntries(
    fieldNames.map((name) => [name, new ElementStub()])
  );
  form.values = {};
  form.elements = {
    namedItem(name) {
      return fields[name] ?? null;
    },
  };
  form.querySelector = (selector) => {
    if (selector === 'button[type="submit"]') return submitButton;
    if (selector === '#employee-edit-cancel') return cancelEditButton;
    return null;
  };
  form.setValues = (values) => {
    form.values = values;
    for (const [name, field] of Object.entries(fields)) {
      field.value = values[name] ?? '';
    }
  };
  form.resetCalls = 0;
  form.reset = () => {
    form.resetCalls += 1;
    form.listeners.get('reset')();
    form.setValues({});
  };

  const departmentSelect = new ElementStub();
  const feedback = new ElementStub();

  vi.stubGlobal('document', {
    createElement: () => new ElementStub(),
    querySelector(selector) {
      if (selector === '#employee-form') return form;
      if (selector === '#employee-department') return departmentSelect;
      if (selector === '#employee-form-feedback') return feedback;
      if (selector === '#employee-form-title') return title;
      const errorField = fieldNames.find((name) => selector === `#employee-${name}-error`);
      if (errorField) return errors[errorField];
      return null;
    },
  });
  vi.stubGlobal('FormData', FormDataStub);

  return {
    cancelEditButton,
    departmentSelect,
    errors,
    feedback,
    fields,
    form,
    submitButton,
    title,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Employee registration form', () => {
  it('should report incomplete form markup', () => {
    vi.stubGlobal('document', {
      querySelector: () => null,
    });

    expect(() => initializeEmployeeForm()).toThrow(
      'A estrutura do formulário de colaboradores está incompleta.'
    );
  });

  it('should populate department options from the domain validator', () => {
    const { departmentSelect } = setupForm();

    initializeEmployeeForm();

    expect(departmentSelect.options.map((option) => option.value)).toEqual([
      '',
      ...ALLOWED_DEPARTMENTS,
    ]);
  });

  it('should create an employee through the store and show success feedback', () => {
    const { feedback, form } = setupForm();
    initializeEmployeeForm();
    const email = `form-${Date.now()}@staffpulse.com`;
    form.setValues({
      name: 'Fernanda Oliveira',
      email,
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    });
    let defaultPrevented = false;

    form.listeners.get('submit')({
      preventDefault() {
        defaultPrevented = true;
      },
    });

    const createdEmployee = getEmployees().find(
      (employee) => employee.email === email
    );
    expect(defaultPrevented).toBe(true);
    expect(createdEmployee).toMatchObject({
      name: 'Fernanda Oliveira',
      email,
      salary: 6500,
      admissionDate: '2022-03-10',
      department: 'TI',
      status: 'ativo',
    });
    expect(feedback.textContent).toBe('Colaborador cadastrado com sucesso.');
    expect(feedback.dataset.state).toBe('success');
    expect(form.resetCalls).toBe(1);

    removeEmployee(createdEmployee.id);
  });

  it('should show service errors and leave the form available for retry', () => {
    const { feedback, form, submitButton } = setupForm();
    initializeEmployeeForm();
    form.setValues({
      name: 'Joana Silva',
      email: `failed-create-${Date.now()}@staffpulse.com`,
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    });
    vi.spyOn(employeeStore, 'addEmployee').mockImplementation(() => {
      throw new Error('Não foi possível persistir os colaboradores.');
    });

    form.listeners.get('submit')({ preventDefault() {} });

    expect(feedback.textContent).toBe('Não foi possível persistir os colaboradores.');
    expect(feedback.dataset.state).toBe('error');
    expect(form.resetCalls).toBe(0);
    expect(submitButton.disabled).toBe(false);
  });

  it('should edit the selected employee through the store and preserve unchanged data', () => {
    const { cancelEditButton, feedback, fields, form, submitButton, title } = setupForm();
    const email = `form-edit-${Date.now()}@staffpulse.com`;
    const [employee] = addEmployee({
      name: 'Fernanda Oliveira',
      email,
      salary: 6500,
      admissionDate: '2022-03-10',
      department: 'TI',
    });

    initializeEmployeeForm();
    startEmployeeEdit(employee.id);

    expect(fields.name.value).toBe('Fernanda Oliveira');
    expect(fields.email.value).toBe(email);
    expect(fields.salary.value).toBe(6500);
    expect(fields.admissionDate.value).toBe('2022-03-10');
    expect(fields.department.value).toBe('TI');
    expect(form.elements.namedItem('id')).toBeNull();
    expect(Object.isFrozen(employee)).toBe(true);
    expect(title.textContent).toBe('Editar colaborador');
    expect(submitButton.textContent).toBe('Salvar alterações');
    expect(cancelEditButton.hidden).toBe(false);

    fields.salary.value = '7200';
    form.listeners.get('submit')({ preventDefault() {} });

    const updatedEmployee = getEmployees().find(({ id }) => id === employee.id);
    expect(updatedEmployee).toMatchObject({
      id: employee.id,
      name: 'Fernanda Oliveira',
      email,
      salary: 7200,
      admissionDate: '2022-03-10',
      department: 'TI',
      status: 'ativo',
    });
    expect(feedback.textContent).toBe('Colaborador atualizado com sucesso.');
    expect(submitButton.textContent).toBe('Cadastrar colaborador');
    expect(cancelEditButton.hidden).toBe(true);

    removeEmployee(employee.id);
  });

  it('should cancel editing and restore the registration form', () => {
    const { cancelEditButton, fields, submitButton, title } = setupForm();
    const email = `form-cancel-${Date.now()}@staffpulse.com`;
    const [employee] = addEmployee({
      name: 'Fernanda Oliveira',
      email,
      salary: 6500,
      admissionDate: '2022-03-10',
      department: 'TI',
    });

    initializeEmployeeForm();
    startEmployeeEdit(employee.id);
    cancelEditButton.listeners.get('click')();

    expect(fields.name.value).toBe('');
    expect(title.textContent).toBe('Novo colaborador');
    expect(submitButton.textContent).toBe('Cadastrar colaborador');
    expect(cancelEditButton.hidden).toBe(true);

    removeEmployee(employee.id);
  });

  it('should ignore a repeated submit while a creation is notifying subscribers', () => {
    const { form, submitButton } = setupForm();
    initializeEmployeeForm();
    const email = `duplicate-click-${Date.now()}@staffpulse.com`;
    form.setValues({
      name: 'Joana Silva',
      email,
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    });

    let submitAttempts = 0;
    const unsubscribe = subscribeToEmployeeChanges(() => {
      if (submitAttempts === 0) {
        submitAttempts += 1;
        expect(submitButton.disabled).toBe(true);
        form.listeners.get('submit')({ preventDefault() {} });
      }
    });

    form.listeners.get('submit')({ preventDefault() {} });
    unsubscribe();

    const matchingEmployees = getEmployees().filter((employee) => employee.email === email);
    expect(matchingEmployees).toHaveLength(1);
    expect(submitAttempts).toBe(1);
    expect(submitButton.disabled).toBe(false);
    removeEmployee(matchingEmployees[0].id);
  });

  it('should show validator errors without creating an employee', () => {
    const { errors, fields, form } = setupForm();
    initializeEmployeeForm();
    form.setValues({
      name: 'Al',
      email: 'invalid-form@staffpulse.com',
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    });

    form.listeners.get('submit')({ preventDefault() {} });

    expect(errors.name.textContent).toBe('O nome deve possuir no mínimo 3 caracteres.');
    expect(errors.name.hidden).toBe(false);
    expect(fields.name.getAttribute('aria-invalid')).toBe('true');
    expect(fields.name.focused).toBe(true);
    expect(getEmployees().some((employee) => employee.email === form.values.email)).toBe(false);
  });

  it('should validate all fields and remove field errors after correction', () => {
    const { errors, fields, form } = setupForm();
    initializeEmployeeForm();
    form.setValues({
      name: 'A',
      email: 'invalid',
      salary: '10',
      admissionDate: '2023-02-30',
      department: '',
    });

    form.listeners.get('submit')({ preventDefault() {} });

    expect(errors.name.textContent).toBe('O nome deve possuir no mínimo 3 caracteres.');
    expect(errors.email.textContent).toBe('Formato de e-mail corporativo inválido.');
    expect(errors.salary.textContent).toContain('piso mínimo legal');
    expect(errors.admissionDate.textContent).toBe(
      'A data de admissão informada é calendariamente inválida.'
    );
    expect(errors.department.textContent).toBe('O departamento é obrigatório.');

    fields.name.value = 'Ana Costa';
    form.listeners.get('input')({ target: fields.name });
    expect(errors.name.hidden).toBe(true);
    expect(fields.name.getAttribute('aria-invalid')).toBe('false');
  });

  it('should clear feedback when the form is reset', () => {
    const { errors, feedback, fields, form } = setupForm();
    initializeEmployeeForm();
    feedback.textContent = 'Previous feedback';
    feedback.dataset.state = 'error';
    feedback.hidden = false;
    errors.name.textContent = 'Nome inválido.';
    errors.name.hidden = false;
    fields.name.setAttribute('aria-invalid', 'true');

    form.reset();

    expect(feedback.textContent).toBe('');
    expect(feedback.dataset.state).toBeUndefined();
    expect(feedback.hidden).toBe(true);
    expect(errors.name.textContent).toBe('');
    expect(errors.name.hidden).toBe(true);
    expect(fields.name.getAttribute('aria-invalid')).toBe('false');
  });
});
