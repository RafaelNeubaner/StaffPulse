import { ALLOWED_DEPARTMENTS } from './validators.js';
import {
  getEmployees,
  getPayrollStats,
  subscribeToEmployeeChanges,
} from './employee-store.js';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function initializeDashboard() {
  const dashboard = document.querySelector('#dashboard-indicators');
  const departmentDistribution = document.querySelector('#department-distribution');
  const roleDistribution = document.querySelector('#role-distribution');

  if (!dashboard || !departmentDistribution || !roleDistribution) {
    throw new Error('A estrutura de indicadores do Dashboard está incompleta.');
  }

  const updateDashboard = () => {
    const employees = getEmployees();
    const stats = getPayrollStats();

    renderDashboardStats(dashboard, stats);
    renderDashboardDistributions(departmentDistribution, roleDistribution, employees, stats);
  };

  updateDashboard();
  return subscribeToEmployeeChanges(updateDashboard);
}

export function renderDashboardStats(dashboard, stats) {
  dashboard.querySelector('#active-employees').textContent = numberFormatter.format(
    stats.activeEmployees
  );
  dashboard.querySelector('#total-employees').textContent = numberFormatter.format(
    stats.totalEmployees
  );
  dashboard.querySelector('#total-payroll').textContent = currencyFormatter.format(
    stats.totalPayroll
  );
  dashboard.querySelector('#average-salary').textContent = currencyFormatter.format(
    stats.averageSalary
  );

}

export function renderDashboardDistributions(
  departmentDistribution,
  roleDistribution,
  employees,
  stats
) {
  if (employees.length === 0) {
    renderEmptyDistribution(departmentDistribution);
    renderEmptyDistribution(roleDistribution);
    return;
  }

  const departmentCounts = Object.fromEntries(
    ALLOWED_DEPARTMENTS.map((department) => [department, 0])
  );
  for (const employee of employees) {
    departmentCounts[employee.department] += 1;
  }

  renderDistribution(
    departmentDistribution,
    Object.entries(departmentCounts),
    employees.length
  );
  renderDistribution(
    roleDistribution,
    Object.entries(stats.countByRole).sort(([firstRole], [secondRole]) =>
      firstRole.localeCompare(secondRole, 'pt-BR')
    ),
    employees.length
  );
}

function renderEmptyDistribution(container) {
  const message = document.createElement('p');
  message.className = 'distribution-empty';
  message.textContent = 'Nenhum colaborador cadastrado.';
  container.replaceChildren(message);
}

function renderDistribution(container, entries, totalEmployees) {
  const rows = entries.map(([label, count]) => {
    const row = document.createElement('li');
    row.className = 'distribution-row';

    const heading = document.createElement('div');
    heading.className = 'distribution-row__heading';

    const name = document.createElement('span');
    name.className = 'distribution-row__label';
    name.textContent = label;

    const total = document.createElement('span');
    total.className = 'distribution-row__count';
    total.textContent = numberFormatter.format(count);

    const meter = document.createElement('div');
    meter.className = 'distribution-meter';
    meter.setAttribute('role', 'progressbar');
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', String(totalEmployees));
    meter.setAttribute('aria-valuenow', String(count));
    meter.setAttribute(
      'aria-label',
      `${label}: ${numberFormatter.format(count)} de ${numberFormatter.format(totalEmployees)} colaboradores`
    );

    const fill = document.createElement('span');
    fill.className = 'distribution-meter__fill';
    fill.setAttribute('aria-hidden', 'true');
    fill.style.width = `${(count / totalEmployees) * 100}%`;

    meter.append(fill);
    heading.append(name, total);
    row.append(heading, meter);
    return row;
  });

  const list = document.createElement('ul');
  list.className = 'distribution-list';
  list.append(...rows);
  container.replaceChildren(list);
}
