import { describe, it, expect } from 'vitest';
import { createEmployee } from '../../src/js/employee-service.js';

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
});
