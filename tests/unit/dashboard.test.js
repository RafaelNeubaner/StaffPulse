import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculatePayrollStats } from '../../src/js/employee-service.js';
import { addEmployee, removeEmployee } from '../../src/js/employee-store.js';
import { initializeDashboard, renderDashboardStats } from '../../src/js/dashboard.js';

function createDashboardElements() {
  const values = new Map(
    ['#active-employees', '#total-employees', '#total-payroll', '#average-salary'].map(
      (selector) => [selector, { textContent: '' }]
    )
  );

  return {
    dashboard: {
      querySelector(selector) {
        return values.get(selector);
      },
    },
    roleCounts: { textContent: '' },
    values,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Dashboard indicators', () => {
  it('should display zero values and an empty message when there are no employees', () => {
    const elements = createDashboardElements();
    const stats = calculatePayrollStats([]);

    renderDashboardStats(elements.dashboard, elements.roleCounts, stats);

    expect(elements.values.get('#active-employees').textContent).toBe('0');
    expect(elements.values.get('#total-employees').textContent).toBe('0');
    expect(elements.values.get('#total-payroll').textContent).toContain('0,00');
    expect(elements.values.get('#average-salary').textContent).toContain('0,00');
    expect(elements.roleCounts.textContent).toBe('Nenhum colaborador cadastrado.');
  });

  it('should render payroll and role indicators using service results', () => {
    const elements = createDashboardElements();
    const stats = calculatePayrollStats([
      { salary: 6500, role: 'Engenheira de Software', status: 'ativo' },
      { salary: 4500, role: 'Analista', status: 'inativo' },
    ]);

    renderDashboardStats(elements.dashboard, elements.roleCounts, stats);

    expect(elements.values.get('#active-employees').textContent).toBe('1');
    expect(elements.values.get('#total-employees').textContent).toBe('2');
    expect(elements.values.get('#total-payroll').textContent).toContain('11.000,00');
    expect(elements.values.get('#average-salary').textContent).toContain('5.500,00');
    expect(elements.roleCounts.textContent).toBe(
      'Engenheira de Software: 1 · Analista: 1'
    );
  });

  it('should refresh dashboard indicators when the employee store changes', () => {
    const elements = createDashboardElements();
    const documentStub = {
      querySelector(selector) {
        if (selector === '#dashboard-indicators') return elements.dashboard;
        if (selector === '#role-counts') return elements.roleCounts;
        return null;
      },
    };
    vi.stubGlobal('document', documentStub);
    let unsubscribe = () => {};
    const id = `dashboard-test-${Date.now()}`;

    try {
      unsubscribe = initializeDashboard();
      addEmployee({
        id,
        name: 'Fernanda Oliveira',
        email: 'fernanda.oliveira@staffpulse.com',
        salary: 6500,
        admissionDate: '2022-03-10',
        department: 'TI',
        role: 'Engenheira de Software',
      });

      expect(elements.values.get('#active-employees').textContent).toBe('1');
      expect(elements.values.get('#total-employees').textContent).toBe('1');
      expect(elements.values.get('#total-payroll').textContent).toContain('6.500,00');

      removeEmployee(id);
      expect(elements.values.get('#total-employees').textContent).toBe('0');
    } finally {
      unsubscribe();
    }
  });
});
