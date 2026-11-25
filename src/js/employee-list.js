import { getEmployees, subscribeToEmployeeChanges } from './employee-store.js';
import { startEmployeeEdit } from './employee-form.js';
import {
  filterEmployees as filterEmployeesByCriteria,
  searchByName,
  sortEmployees,
} from './employee-service.js';
import { ALLOWED_DEPARTMENTS, ALLOWED_STATUSES } from './validators.js';

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
  const departmentFilter = document.querySelector('#employee-department-filter');
  const statusFilter = document.querySelector('#employee-status-filter');
  const clearFiltersButton = document.querySelector('#employee-filters-clear');
  const sortField = document.querySelector('#employee-sort-field');
  const sortOrder = document.querySelector('#employee-sort-order');
  const detailsDialog = document.querySelector('#employee-details-dialog');
  const detailsContent = document.querySelector('#employee-details-content');
  const closeDetailsButton = document.querySelector('#employee-details-close');
  if (
    !container ||
    !searchInput ||
    !clearSearchButton ||
    !departmentFilter ||
    !statusFilter ||
    !clearFiltersButton ||
    !sortField ||
    !sortOrder ||
    !detailsDialog ||
    !detailsContent ||
    !closeDetailsButton
  ) {
    throw new Error('A estrutura de listagem e controles de colaboradores está incompleta.');
  }

  populateFilter(departmentFilter, 'Todos os departamentos', ALLOWED_DEPARTMENTS);
  populateFilter(statusFilter, 'Todos os status', ALLOWED_STATUSES);

  const getActiveFilters = () => ({
    department: departmentFilter.value,
    status: statusFilter.value,
  });

  const refreshEmployeeList = (employees = getEmployees()) => {
    const query = searchInput.value;
    const filters = getActiveFilters();
    const visibleEmployees = getVisibleEmployees(
      employees,
      query,
      filters,
      sortField.value,
      sortOrder.value
    );
    renderEmployeeList(container, visibleEmployees, { query, filters });
    clearSearchButton.hidden = !query.trim();
    clearFiltersButton.hidden = !filters.department && !filters.status;
  };

  searchInput.addEventListener('input', () => refreshEmployeeList());
  clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    refreshEmployeeList();
    searchInput.focus();
  });
  departmentFilter.addEventListener('change', () => refreshEmployeeList());
  statusFilter.addEventListener('change', () => refreshEmployeeList());
  clearFiltersButton.addEventListener('click', () => {
    departmentFilter.value = '';
    statusFilter.value = '';
    refreshEmployeeList();
    departmentFilter.focus();
  });
  sortField.addEventListener('change', () => refreshEmployeeList());
  sortOrder.addEventListener('change', () => refreshEmployeeList());
  closeDetailsButton.addEventListener('click', () => detailsDialog.close());

  refreshEmployeeList();
  return subscribeToEmployeeChanges(refreshEmployeeList);
}

export function getVisibleEmployees(
  employees,
  query = '',
  filters = {},
  sortBy = 'name',
  order = 'asc'
) {
  const matchingEmployees = searchByName(employees, query);
  const filteredEmployees = filterEmployeesByCriteria(matchingEmployees, filters);
  return sortEmployees(filteredEmployees, sortBy, order);
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
    const detailsButton = createActionButton(
      'Detalhes',
      `Ver detalhes de ${employee.name}`,
      () => showEmployeeDetails(employee.id)
    );
    const editButton = createActionButton(
      'Editar',
      `Editar ${employee.name}`,
      () => startEmployeeEdit(employee.id)
    );
    actionCell.append(detailsButton, editButton);
    row.append(actionCell);

    body.append(row);
  }

  table.append(caption, header, body);
  wrapper.append(table);
  container.replaceChildren(wrapper);
  renderedLists.set(container, signature);
}

function showEmployeeDetails(employeeId) {
  const dialog = document.querySelector('#employee-details-dialog');
  const content = document.querySelector('#employee-details-content');
  const employee = getEmployees().find(({ id }) => id === employeeId);

  if (!dialog || !content) {
    throw new Error('A estrutura dos detalhes do colaborador está incompleta.');
  }
  if (!employee) {
    throw new Error('Colaborador não encontrado.');
  }

  renderEmployeeDetails(content, employee);
  dialog.showModal();
}

export function renderEmployeeDetails(container, employee) {
  const details = [
    ['ID', employee.id],
    ['Nome', employee.name],
    ['E-mail', employee.email],
    ['Departamento', employee.department],
    ['Salário', currencyFormatter.format(employee.salary)],
    ['Data de admissão', dateFormatter.format(new Date(`${employee.admissionDate}T00:00:00`))],
    ['Cargo', employee.role],
    ['Status', employee.status],
  ];

  const items = details.map(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'employee-details__item';

    const term = document.createElement('dt');
    term.textContent = label;

    const description = document.createElement('dd');
    description.textContent = value;

    item.append(term, description);
    return item;
  });

  container.replaceChildren(...items);
}

function createActionButton(label, accessibleLabel, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button-secondary employee-table__action';
  button.textContent = label;
  button.setAttribute('aria-label', accessibleLabel);
  button.addEventListener('click', onClick);
  return button;
}

function populateFilter(select, placeholder, values) {
  const options = [placeholder, ...values].map((label, index) => {
    const option = document.createElement('option');
    option.value = index === 0 ? '' : label;
    option.textContent = label;
    return option;
  });
  select.replaceChildren(...options);
}

function appendTextCell(row, text, className = '') {
  const cell = document.createElement('td');
  if (className) {
    cell.className = className;
  }
  cell.textContent = text;
  row.append(cell);
}
