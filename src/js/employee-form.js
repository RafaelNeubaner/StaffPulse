import { addEmployee } from './employee-store.js';
import {
  ALLOWED_DEPARTMENTS,
  ValidationError,
  validateAdmissionDate,
  validateDepartment,
  validateEmail,
  validateName,
  validateSalary,
} from './validators.js';

const fieldValidators = [
  { name: 'name', validate: validateName },
  { name: 'email', validate: validateEmail },
  { name: 'salary', validate: validateSalary },
  { name: 'admissionDate', validate: validateAdmissionDate },
  { name: 'department', validate: validateDepartment },
];

export function initializeEmployeeForm() {
  const form = document.querySelector('#employee-form');
  const departmentSelect = document.querySelector('#employee-department');
  const feedback = document.querySelector('#employee-form-feedback');
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!form || !departmentSelect || !feedback || !submitButton) {
    throw new Error('A estrutura do formulário de colaboradores está incompleta.');
  }

  populateDepartments(departmentSelect);
  const fields = fieldValidators.map((rule) => {
    const input = form.elements.namedItem(rule.name);
    const error = document.querySelector(`#employee-${rule.name}-error`);

    if (!input || !error) {
      throw new Error(`O campo "${rule.name}" não está configurado corretamente.`);
    }

    return { ...rule, input, error };
  });

  let isSubmitting = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const firstInvalidField = validateFields(fields);
    if (firstInvalidField) {
      clearFeedback(feedback);
      firstInvalidField.input.focus();
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;

    try {
      const employeeData = Object.fromEntries(new FormData(form).entries());
      addEmployee(employeeData);
      form.reset();
      showFeedback(feedback, 'Colaborador cadastrado com sucesso.', 'success');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (error instanceof ValidationError) {
        const invalidField = fields.find((field) => field.name === error.field);
        if (invalidField) {
          showFieldError(invalidField, error.message);
          invalidField.input.focus();
          return;
        }
      }

      showFeedback(feedback, error.message, 'error');
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
    }
  });

  const clearCorrectedFieldError = (event) => {
    const field = fields.find(({ input }) => input === event.target);
    if (field && !field.error.hidden) {
      validateField(field);
    }
  };

  form.addEventListener('input', clearCorrectedFieldError);
  form.addEventListener('change', clearCorrectedFieldError);

  form.addEventListener('reset', () => {
    for (const field of fields) {
      clearFieldError(field);
    }
    clearFeedback(feedback);
  });
}

function validateFields(fields) {
  let firstInvalidField = null;

  for (const field of fields) {
    if (!validateField(field) && !firstInvalidField) {
      firstInvalidField = field;
    }
  }

  return firstInvalidField;
}

function validateField(field) {
  try {
    field.validate(field.input.value);
    clearFieldError(field);
    return true;
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    showFieldError(field, error.message);
    return false;
  }
}

function showFieldError(field, message) {
  field.input.setAttribute('aria-invalid', 'true');
  field.error.textContent = message;
  field.error.hidden = false;
}

function clearFieldError(field) {
  field.input.setAttribute('aria-invalid', 'false');
  field.error.textContent = '';
  field.error.hidden = true;
}

function populateDepartments(select) {
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecione um departamento';
  placeholder.disabled = true;
  placeholder.selected = true;

  const options = ALLOWED_DEPARTMENTS.map((department) => {
    const option = document.createElement('option');
    option.value = department;
    option.textContent = department;
    return option;
  });

  select.replaceChildren(placeholder, ...options);
}

function showFeedback(container, message, state) {
  container.textContent = message;
  container.dataset.state = state;
  container.hidden = false;
}

function clearFeedback(container) {
  container.textContent = '';
  delete container.dataset.state;
  container.hidden = true;
}
