import { getEmployees, subscribeToEmployeeChanges } from './employee-store.js';
import { startEmployeeEdit } from './employee-form.js';
import {
  filterEmployees as filterEmployeesByCriteria,
  searchByName,
} from './employee-service.js';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR');
const renderedLists = new WeakMap();

export function initializeEmployeeList() {
  const container = document.querySelector('#employee-list-content');
  const searchInput = document.querySelector('#employee-search');
  const clearSearchButton = document.querySelector('#employee-search-clear');
  if (!container || !searchInput || !clearSearchButton) {
    throw new Error('A estrutura da pesquisa de colaboradores está incompleta.');
  }

  const activeFilters = {};
  const refreshEmployeeList = (employees = getEmployees()) => {
    const query = searchInput.value;
    const visibleEmployees = getVisibleEmployees(employees, query, activeFilters);
    renderEmployeeList(container, visibleEmployees, { query, filters: activeFilters });
    clearSearchButton.hidden = !query.trim();
  };

  searchInput.addEventListener('input', () => refreshEmployeeList());
  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    refreshEmployeeList();
    searchInput.focus();
  });

  refreshEmployeeList();
  return subscribeToEmployeeChanges(refreshEmployeeList);
}

export function getVisibleEmployees(employees, query = '', filters = {}) {
  return filterEmployeesByCriteria(searchByName(employees, query), filters);
}

export function renderEmployeeList(container, employees, { query = '', filters = {} } = {}) {
  const hasCriteria =
    Boolean(query.trim()) ||
    Object.values(filters).some(
      (value) => value && !['all', 'todos'].includes(String(value).trim().toLowerCase())
    );
  const signature = JSON.stringify([
    employees.map(({ id, name, email, department, salary, admissionDate, status }) => ({
      id,
      name,
      email,
      department,
      salary,
      admissionDate,
      status,
    })),
    hasCriteria,
  ]);
  if (renderedLists.get(container) === signature) {
    return;
  }

  if (employees.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'employee-list-empty';
    emptyMessage.textContent = hasCriteria
      ? 'Nenhum colaborador encontrado.'
      : 'Nenhum colaborador cadastrado.';
    container.replaceChildren(emptyMessage);
    renderedLists.set(container, signature);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'employee-table-wrapper';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Tabela de colaboradores cadastrados');
  wrapper.setAttribute('tabindex', '0');

  const table = document.createElement('table');
  table.className = 'employee-table';

  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = 'Dados dos colaboradores cadastrados';

  const header = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const label of [
    'Nome',
    'E-mail',
    'Departamento',
    'Salário',
    'Data de admissão',
    'Status',
    'Ações',
  ]) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    headerRow.append(cell);
  }
  header.append(headerRow);

  const body = document.createElement('tbody');
  for (const employee of employees) {
    const row = document.createElement('tr');
    appendTextCell(row, employee.name, 'employee-table__name');
    appendTextCell(row, employee.email);
    appendTextCell(row, employee.department);
    appendTextCell(row, currencyFormatter.format(employee.salary), 'employee-table__salary');

    const admissionDate = new Date(`${employee.admissionDate}T00:00:00`);
    appendTextCell(row, dateFormatter.format(admissionDate));

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = 'employee-table__status';
    status.dataset.status = employee.status;
    status.textContent = employee.status;
    statusCell.append(status);
    row.append(statusCell);

    const actionCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'button-secondary employee-table__action';
    editButton.textContent = 'Editar';
    editButton.setAttribute('aria-label', `Editar ${employee.name}`);
    editButton.addEventListener('click', () => startEmployeeEdit(employee.id));
    actionCell.append(editButton);
    row.append(actionCell);

    body.append(row);
  }

  table.append(caption, header, body);
  wrapper.append(table);
  container.replaceChildren(wrapper);
  renderedLists.set(container, signature);
}

function appendTextCell(row, text, className = '') {
  const cell = document.createElement('td');
  if (className) {
    cell.className = className;
  }
  cell.textContent = text;
  row.append(cell);
}
