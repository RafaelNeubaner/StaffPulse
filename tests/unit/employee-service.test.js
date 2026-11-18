import { describe, it, expect } from 'vitest';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
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

describe('Serviço de Colaboradores (employee-service.js)', () => {
  describe('createEmployee', () => {
    it('should create a new employee with a unique ID and return an immutable list when given valid data', () => {
      // Given
      const initialStore = [];
      // When
      const updatedStore = createEmployee(baseEmployeeData, initialStore);
      // Then
      expect(updatedStore).toHaveLength(1);
      expect(initialStore).toHaveLength(0);
      expect(updatedStore[0].id).toBeDefined();
      expect(updatedStore[0].name).toBe('Fernanda Oliveira');
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
      const store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      // When
      const updated = updateEmployee('emp-1', { salary: 8200, department: 'Financeiro' }, store);
      // Then
      expect(updated[0].salary).toBe(8200);
      expect(updated[0].department).toBe('Financeiro');
      expect(updated[0].id).toBe('emp-1');
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
      const store = createEmployee({ ...baseEmployeeData, id: 'emp-1' }, []);
      // When
      const afterLogicalDelete = deleteEmployee('emp-1', store, { logical: true });
      // Then
      expect(afterLogicalDelete).toHaveLength(1);
      expect(afterLogicalDelete[0].status).toBe('inativo');
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
});
