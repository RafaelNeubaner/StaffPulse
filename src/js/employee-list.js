import { getEmployees, subscribeToEmployeeChanges } from './employee-store.js';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const renderedLists = new WeakMap();

export function initializeEmployeeList() {
  const container = document.querySelector('#employee-list-content');
  if (!container) {
    throw new Error('A estrutura da listagem de colaboradores está incompleta.');
  }

  const refreshEmployeeList = (employees = getEmployees()) => {
    renderEmployeeList(container, employees);
  };

  refreshEmployeeList();
  return subscribeToEmployeeChanges(refreshEmployeeList);
}

export function renderEmployeeList(container, employees) {
  const signature = JSON.stringify(
    employees.map(({ id, name, email, department, salary, status }) => ({
      id,
      name,
      email,
      department,
      salary,
      status,
    }))
  );
  if (renderedLists.get(container) === signature) {
    return;
  }

  if (employees.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'employee-list-empty';
    emptyMessage.textContent = 'Nenhum colaborador cadastrado.';
    container.replaceChildren(emptyMessage);
    renderedLists.set(container, signature);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'employee-list';
  list.setAttribute('aria-label', 'Colaboradores cadastrados');

  for (const employee of employees) {
    const item = document.createElement('li');
    item.className = 'employee-list-item';

    const name = document.createElement('h4');
    name.className = 'employee-list-item__name';
    name.textContent = employee.name;

    const details = document.createElement('p');
    details.className = 'employee-list-item__details';
    details.textContent = `${employee.email} · ${employee.department}`;

    const salary = document.createElement('span');
    salary.className = 'employee-list-item__salary';
    salary.textContent = currencyFormatter.format(employee.salary);

    const status = document.createElement('span');
    status.className = 'employee-list-item__status';
    status.dataset.status = employee.status;
    status.textContent = employee.status;

    const information = document.createElement('div');
    information.className = 'employee-list-item__information';
    information.append(name, details);

    const summary = document.createElement('div');
    summary.className = 'employee-list-item__summary';
    summary.append(salary, status);

    item.append(information, summary);
    list.append(item);
  }

  container.replaceChildren(list);
  renderedLists.set(container, signature);
}
