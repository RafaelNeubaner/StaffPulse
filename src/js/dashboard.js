import {
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
  const roleCounts = document.querySelector('#role-counts');

  if (!dashboard || !roleCounts) {
    throw new Error('A estrutura de indicadores do Dashboard está incompleta.');
  }

  const updateDashboard = () => {
    renderDashboardStats(dashboard, roleCounts, getPayrollStats());
  };

  updateDashboard();
  return subscribeToEmployeeChanges(updateDashboard);
}

export function renderDashboardStats(dashboard, roleCounts, stats) {
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

  const roleSummary = Object.entries(stats.countByRole)
    .map(([role, count]) => `${role}: ${numberFormatter.format(count)}`)
    .join(' · ');

  roleCounts.textContent = roleSummary || 'Nenhum colaborador cadastrado.';
}
