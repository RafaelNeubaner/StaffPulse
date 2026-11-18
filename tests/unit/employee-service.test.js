import { describe, it, expect } from 'vitest';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  filterEmployees,
  sortEmployees,
  searchByName,
  calculatePayrollStats,
} from '../../src/js/employee-service.js';

const baseEmployeeData = {
  name: 'Fernanda Oliveira',
  email: 'fernanda.oliveira@staffpulse.com',
  salary: 6500,
  admissionDate: '2022-03-10',
  department: 'TI',
  role: 'Engenheira de Software',
  status: 'ativo',
};

const sampleEmployees = [
  {
    id: 'emp-1',
    name: 'Carlos Eduardo',
    email: 'carlos@staffpulse.com',
    salary: 7000,
    admissionDate: '2021-01-15',
    department: 'TI',
    role: 'Desenvolvedor Senior',
    status: 'ativo',
  },
  {
    id: 'emp-2',
    name: 'Amanda Costa',
    email: 'amanda@staffpulse.com',
    salary: 4500,
    admissionDate: '2023-06-20',
    department: 'RH',
    role: 'Analista de RH',
    status: 'ativo',
  },
  {
    id: 'emp-3',
    name: 'Bruno Santos',
    email: 'bruno@staffpulse.com',
    salary: 5200,
    admissionDate: '2020-11-05',
    department: 'TI',
    role: 'Desenvolvedor Pleno',
    status: 'inativo',
  },
];

describe('Serviço de Colaboradores (employee-service.js)', () => {
  describe('createEmployee', () => {
    it('should create a new employee with a unique ID and return an immutable list when given valid data', () => {
      // Given
      const minimalData = {
        name: 'Fernanda Oliveira',
        email: 'fernanda.oliveira@staffpulse.com',
        salary: 6500,
        admissionDate: '2022-03-10',
        department: 'TI',
      };
      // When
      const updatedStore = createEmployee(minimalData);
      // Then
      expect(updatedStore).toHaveLength(1);
      expect(updatedStore[0].id).toBeDefined();
      expect(updatedStore[0].role).toBe('Analista');
      expect(updatedStore[0].status).toBe('ativo');
      expect(Object.isFrozen(updatedStore)).toBe(true);
      expect(Object.isFrozen(updatedStore[0])).toBe(true);
    });

    it('should throw an error when trying to create an employee with an existing ID in the store', () => {
      // Given
      const storeWithOne = createEmployee({ ...baseEmployeeData, id: 'emp-100' }, []);
      // When / Then
      expect(() =>
        createEmployee({ ...baseEmployeeData, id: 'emp-100' }, storeWithOne)
      ).toThrow('Já existe um colaborador com este ID.');
    });

    it('should throw an error when given null employee data or an invalid store', () => {
      // Given / When / Then
      expect(() => createEmployee(null, [])).toThrow('Dados do colaborador são obrigatórios.');
      expect(() => createEmployee(baseEmployeeData, 'not-an-array')).toThrow(
        'O store deve ser uma lista válida.'
      );
    });
  });

  describe('updateEmployee', () => {
    it('should update employee fields and preserve ID without mutating the original store when given valid updates', () => {
      // Given
      let store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      store = createEmployee(
        { ...baseEmployeeData, id: 'emp-2', name: 'Lucas Mendes', email: 'lucas@staffpulse.com' },
        store
      );
      // When
      const updated = updateEmployee('emp-1', { salary: 8200, department: 'Financeiro' }, store);
      // Then
      expect(updated[0].salary).toBe(8200);
      expect(updated[0].department).toBe('Financeiro');
      expect(updated[0].id).toBe('emp-1');
      expect(updated[1].id).toBe('emp-2');
      expect(store[0].salary).toBe(6500);
    });

    it('should throw an error when trying to update a non-existent employee ID', () => {
      // Given
      const store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      // When / Then
      expect(() => updateEmployee('emp-999', { salary: 7000 }, store)).toThrow(
        'Colaborador não encontrado.'
      );
    });

    it('should throw an error when given invalid update parameters or invalid store', () => {
      // Given
      const store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      // When / Then
      expect(() => updateEmployee('', { salary: 7000 }, store)).toThrow(
        'ID do colaborador é obrigatório.'
      );
      expect(() => updateEmployee('emp-1', null, store)).toThrow(
        'Dados de atualização são obrigatórios.'
      );
      expect(() => updateEmployee('emp-1', { salary: 7000 }, null)).toThrow(
        'O store deve ser uma lista válida.'
      );
    });
  });

  describe('deleteEmployee', () => {
    it('should physically remove the employee from the returned list when logical option is false', () => {
      // Given
      let store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      store = createEmployee(
        { ...baseEmployeeData, id: 'emp-2', name: 'Lucas Mendes', email: 'lucas@staffpulse.com' },
        store
      );
      // When
      const afterDelete = deleteEmployee('emp-1', store);
      // Then
      expect(afterDelete).toHaveLength(1);
      expect(afterDelete[0].id).toBe('emp-2');
      expect(store).toHaveLength(2);
    });

    it('should logically deactivate the employee by setting status to inativo when logical option is enabled', () => {
      // Given
      let store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      store = createEmployee(
        { ...baseEmployeeData, id: 'emp-2', name: 'Lucas Mendes', email: 'lucas@staffpulse.com' },
        store
      );
      // When
      const afterLogicalObj = deleteEmployee('emp-1', store, { logical: true });
      const afterLogicalBool = deleteEmployee('emp-1', store, true);
      // Then
      expect(afterLogicalObj[0].status).toBe('inativo');
      expect(afterLogicalObj[1].status).toBe('ativo');
      expect(afterLogicalBool[0].status).toBe('inativo');
      expect(store[0].status).toBe('ativo');
    });

    it('should throw an error when attempting to delete an employee with an unknown or empty ID', () => {
      // Given
      const store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      // When / Then
      expect(() => deleteEmployee('emp-404', store)).toThrow('Colaborador não encontrado.');
      expect(() => deleteEmployee('', store)).toThrow('ID do colaborador é obrigatório.');
      expect(() => deleteEmployee('emp-1', 'invalid-store')).toThrow(
        'O store deve ser uma lista válida.'
      );
    });
  });

  describe('filterEmployees & sortEmployees', () => {
    it('should filter employees combining department and active status criteria', () => {
      // Given / When
      const tiActive = filterEmployees(sampleEmployees, { department: 'TI', status: 'ativo' });
      const allActive = filterEmployees(sampleEmployees, { department: 'all', status: 'ativo' });
      const allDefault = filterEmployees(sampleEmployees, null);
      // Then
      expect(tiActive).toHaveLength(1);
      expect(tiActive[0].name).toBe('Carlos Eduardo');
      expect(allActive).toHaveLength(2);
      expect(allDefault).toHaveLength(3);
    });

    it('should sort filtered employees by salary and admissionDate in ascending and descending order', () => {
      // Given / When
      const tiSortedBySalaryAsc = filterEmployees(sampleEmployees, {
        department: 'TI',
        sortBy: 'salary',
        order: 'asc',
      });
      const sortedByDateDesc = sortEmployees(sampleEmployees, 'admissionDate', 'desc');
      const sortedByNameAsc = sortEmployees(sampleEmployees);
      // Then
      expect(tiSortedBySalaryAsc.map((e) => e.id)).toEqual(['emp-3', 'emp-1']);
      expect(sortedByDateDesc.map((e) => e.id)).toEqual(['emp-2', 'emp-1', 'emp-3']);
      expect(sortedByNameAsc.map((e) => e.name)).toEqual([
        'Amanda Costa',
        'Bruno Santos',
        'Carlos Eduardo',
      ]);
    });

    it('should throw an error when filterEmployees or sortEmployees receives a non-array list', () => {
      // Given / When / Then
      expect(() => filterEmployees(null, { department: 'TI' })).toThrow(
        'A lista de colaboradores deve ser um array válido.'
      );
      expect(() => sortEmployees('not-an-array', 'name')).toThrow(
        'A lista de colaboradores deve ser um array válido.'
      );
    });
  });

  describe('searchByName & calculatePayrollStats', () => {
    it('should perform case-insensitive name search and return full list copy when query is blank', () => {
      // Given / When
      const found = searchByName(sampleEmployees, '  cArLoS  ');
      const allWhenEmpty = searchByName(sampleEmployees);
      // Then
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('emp-1');
      expect(allWhenEmpty).toHaveLength(3);
      expect(() => searchByName(null, 'carlos')).toThrow(
        'A lista de colaboradores deve ser um array válido.'
      );
    });

    it('should calculate total payroll, average salary, active count, and count by role accurately', () => {
      // Given / When
      const stats = calculatePayrollStats([
        ...sampleEmployees,
        { id: 'emp-4', name: 'Diana', salary: 3300, department: 'TI' },
      ]);
      // Then
      expect(stats.totalPayroll).toBe(20000);
      expect(stats.averageSalary).toBe(5000);
      expect(stats.totalEmployees).toBe(4);
      expect(stats.activeEmployees).toBe(3);
      expect(stats.countByRole).toEqual({
        'Desenvolvedor Senior': 1,
        'Analista de RH': 1,
        'Desenvolvedor Pleno': 1,
        Analista: 1,
      });
    });

    it('should return zeroed payroll statistics when list is empty and throw error when list is invalid', () => {
      // Given / When
      const emptyStats = calculatePayrollStats();
      // Then
      expect(emptyStats).toEqual({
        totalPayroll: 0,
        averageSalary: 0,
        countByRole: {},
        totalEmployees: 0,
        activeEmployees: 0,
      });
      expect(() => calculatePayrollStats('invalid')).toThrow(
        'A lista de colaboradores deve ser um array válido.'
      );
    });
  });
});
