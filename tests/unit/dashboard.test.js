import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculatePayrollStats } from '../../src/js/employee-service.js';
import { addEmployee, removeEmployee } from '../../src/js/employee-store.js';
import {
  initializeDashboard,
  renderDashboardDistributions,
  renderDashboardStats,
} from '../../src/js/dashboard.js';

class ElementStub {
  constructor() {
    this.attributes = {};
    this.children = [];
    this.style = {};
    this.textContent = '';
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
    this.textContent = '';
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }
}

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
    departmentDistribution: new ElementStub(),
    roleDistribution: new ElementStub(),
    values,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubDocument(elements) {
  vi.stubGlobal('document', {
    createElement: () => new ElementStub(),
    querySelector(selector) {
      if (selector === '#dashboard-indicators') return elements.dashboard;
      if (selector === '#department-distribution') return elements.departmentDistribution;
      if (selector === '#role-distribution') return elements.roleDistribution;
      return null;
    },
  });
}

describe('Dashboard indicators', () => {
  it('should display zero values and an empty message when there are no employees', () => {
    const elements = createDashboardElements();
    const stats = calculatePayrollStats([]);

    renderDashboardStats(elements.dashboard, stats);

    expect(elements.values.get('#active-employees').textContent).toBe('0');
    expect(elements.values.get('#total-employees').textContent).toBe('0');
    expect(elements.values.get('#total-payroll').textContent).toContain('0,00');
    expect(elements.values.get('#average-salary').textContent).toContain('0,00');
    vi.stubGlobal('document', { createElement: () => new ElementStub() });
    renderDashboardDistributions(
      elements.departmentDistribution,
      elements.roleDistribution,
      [],
      stats
    );
    expect(elements.departmentDistribution.children[0].textContent).toBe(
      'Nenhum colaborador cadastrado.'
    );
    expect(elements.roleDistribution.children[0].textContent).toBe(
      'Nenhum colaborador cadastrado.'
    );
  });

  it('should render payroll indicators using service results', () => {
    const elements = createDashboardElements();
    const stats = calculatePayrollStats([
      { salary: 6500, role: 'Engenheira de Software', status: 'ativo' },
      { salary: 4500, role: 'Analista', status: 'inativo' },
    ]);

    renderDashboardStats(elements.dashboard, stats);

    expect(elements.values.get('#active-employees').textContent).toBe('1');
    expect(elements.values.get('#total-employees').textContent).toBe('2');
    expect(elements.values.get('#total-payroll').textContent).toContain('11.000,00');
    expect(elements.values.get('#average-salary').textContent).toContain('5.500,00');
  });

  it('should render department and role distributions from employee records and service stats', () => {
    const elements = createDashboardElements();
    const employees = [
      { department: 'TI', role: 'Desenvolvedora', salary: 6500, status: 'ativo' },
      { department: 'TI', role: 'Analista', salary: 4500, status: 'ativo' },
      { department: 'RH', role: 'Analista', salary: 5000, status: 'inativo' },
    ];
    const stats = calculatePayrollStats(employees);
    vi.stubGlobal('document', { createElement: () => new ElementStub() });

    renderDashboardDistributions(
      elements.departmentDistribution,
      elements.roleDistribution,
      employees,
      stats
    );

    const departmentRows = elements.departmentDistribution.children[0].children;
    const roleRows = elements.roleDistribution.children[0].children;

    expect(departmentRows).toHaveLength(4);
    expect(departmentRows[0].children[0].children[0].textContent).toBe('TI');
    expect(departmentRows[0].children[0].children[1].textContent).toBe('2');
    expect(departmentRows[0].children[1].children[0].style.width).toBe(
      `${(2 / employees.length) * 100}%`
    );
    expect(roleRows).toHaveLength(2);
    expect(roleRows[0].children[0].children[0].textContent).toBe('Analista');
    expect(roleRows[0].children[0].children[1].textContent).toBe('2');
  });

  it('should refresh dashboard indicators when the employee store changes', () => {
    const elements = createDashboardElements();
    stubDocument(elements);
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
      expect(elements.departmentDistribution.children[0].children[0].children[0].children[0].textContent).toBe(
        'TI'
      );
      expect(
        elements.roleDistribution.children[0].children[0].children[0].children[0].textContent
      ).toBe('Engenheira de Software');

      removeEmployee(id);
      expect(elements.values.get('#total-employees').textContent).toBe('0');
      expect(elements.departmentDistribution.children[0].textContent).toBe(
        'Nenhum colaborador cadastrado.'
      );
      expect(elements.roleDistribution.children[0].textContent).toBe(
        'Nenhum colaborador cadastrado.'
      );
    } finally {
      unsubscribe();
    }
  });
});
