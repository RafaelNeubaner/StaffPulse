import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEmployees, removeEmployee } from '../../src/js/employee-store.js';
import { ALLOWED_DEPARTMENTS } from '../../src/js/validators.js';
import { initializeEmployeeForm } from '../../src/js/employee-form.js';

class ElementStub {
  constructor() {
    this.dataset = {};
    this.listeners = new Map();
    this.options = [];
    this.textContent = '';
    this.hidden = false;
  }

  addEventListener(eventName, listener) {
    this.listeners.set(eventName, listener);
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
    return Object.entries(this.form.values);
  }
}

function setupForm() {
  const form = new ElementStub();
  form.values = {};
  form.resetCalls = 0;
  form.reset = () => {
    form.resetCalls += 1;
    form.listeners.get('reset')();
  };

  const departmentSelect = new ElementStub();
  const feedback = new ElementStub();

  vi.stubGlobal('document', {
    createElement: () => new ElementStub(),
    querySelector(selector) {
      if (selector === '#employee-form') return form;
      if (selector === '#employee-department') return departmentSelect;
      if (selector === '#employee-form-feedback') return feedback;
      return null;
    },
  });
  vi.stubGlobal('FormData', FormDataStub);

  return { departmentSelect, feedback, form };
}

afterEach(() => {
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
    form.values = {
      name: 'Fernanda Oliveira',
      email: `form-${Date.now()}@staffpulse.com`,
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    };
    let defaultPrevented = false;

    form.listeners.get('submit')({
      preventDefault() {
        defaultPrevented = true;
      },
    });

    const createdEmployee = getEmployees().find(
      (employee) => employee.email === form.values.email
    );
    expect(defaultPrevented).toBe(true);
    expect(createdEmployee).toMatchObject({
      name: 'Fernanda Oliveira',
      salary: 6500,
      department: 'TI',
      status: 'ativo',
    });
    expect(feedback.textContent).toBe('Colaborador cadastrado com sucesso.');
    expect(feedback.dataset.state).toBe('success');
    expect(form.resetCalls).toBe(1);

    removeEmployee(createdEmployee.id);
  });

  it('should show service validation errors without creating an employee', () => {
    const { feedback, form } = setupForm();
    initializeEmployeeForm();
    form.values = {
      name: 'Al',
      email: 'invalid-form@staffpulse.com',
      salary: '6500',
      admissionDate: '2022-03-10',
      department: 'TI',
    };

    form.listeners.get('submit')({ preventDefault() {} });

    expect(feedback.textContent).toBe('O nome deve possuir no mínimo 3 caracteres.');
    expect(feedback.dataset.state).toBe('error');
    expect(getEmployees().some((employee) => employee.email === form.values.email)).toBe(false);
  });

  it('should clear feedback when the form is reset', () => {
    const { feedback, form } = setupForm();
    initializeEmployeeForm();
    feedback.textContent = 'Previous feedback';
    feedback.dataset.state = 'error';
    feedback.hidden = false;

    form.reset();

    expect(feedback.textContent).toBe('');
    expect(feedback.dataset.state).toBeUndefined();
    expect(feedback.hidden).toBe(true);
  });
});
