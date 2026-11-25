import { addEmployee } from './employee-store.js';
import { ALLOWED_DEPARTMENTS } from './validators.js';

export function initializeEmployeeForm() {
  const form = document.querySelector('#employee-form');
  const departmentSelect = document.querySelector('#employee-department');
  const feedback = document.querySelector('#employee-form-feedback');

  if (!form || !departmentSelect || !feedback) {
    throw new Error('A estrutura do formulário de colaboradores está incompleta.');
  }

  populateDepartments(departmentSelect);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      const employeeData = Object.fromEntries(new FormData(form).entries());
      addEmployee(employeeData);
      form.reset();
      showFeedback(feedback, 'Colaborador cadastrado com sucesso.', 'success');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showFeedback(feedback, error.message, 'error');
    }
  });

  form.addEventListener('reset', () => {
    clearFeedback(feedback);
  });
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
