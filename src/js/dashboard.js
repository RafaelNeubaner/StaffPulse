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

const renderedDistributions = new WeakMap();

export function initializeDashboard() {
  const dashboard = document.querySelector('#dashboard-indicators');
  const departmentDistribution = document.querySelector('#department-distribution');
  const roleDistribution = document.querySelector('#role-distribution');

  if (!dashboard || !departmentDistribution || !roleDistribution) {
    throw new Error('A estrutura de indicadores do Dashboard está incompleta.');
  }

  const refreshDashboard = () => {
    const employees = getEmployees();
    const stats = getPayrollStats();

    renderDashboard({
      dashboard,
      departmentDistribution,
      employees,
      roleDistribution,
      stats,
    });
  };

  refreshDashboard();
  return subscribeToEmployeeChanges(refreshDashboard);
}

export function renderDashboard({
  dashboard,
  departmentDistribution,
  employees,
  roleDistribution,
  stats,
}) {
  renderDashboardStats(dashboard, stats);
  renderDashboardDistributions(departmentDistribution, roleDistribution, employees, stats);
}

export function renderDashboardStats(dashboard, stats) {
  updateText(dashboard, '#active-employees', numberFormatter.format(stats.activeEmployees));
  updateText(dashboard, '#total-employees', numberFormatter.format(stats.totalEmployees));
  updateText(dashboard, '#total-payroll', currencyFormatter.format(stats.totalPayroll));
  updateText(dashboard, '#average-salary', currencyFormatter.format(stats.averageSalary));
}

function updateText(container, selector, text) {
  const element = container.querySelector(selector);
  if (element.textContent !== text) {
    element.textContent = text;
  }
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
  const signature = 'empty';
  if (renderedDistributions.get(container) === signature) {
    return;
  }

  const message = document.createElement('p');
  message.className = 'distribution-empty';
  message.textContent = 'Nenhum colaborador cadastrado.';
  container.replaceChildren(message);
  renderedDistributions.set(container, signature);
}

function renderDistribution(container, entries, totalEmployees) {
  const signature = JSON.stringify([entries, totalEmployees]);
  if (renderedDistributions.get(container) === signature) {
    return;
  }

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
  renderedDistributions.set(container, signature);
}
