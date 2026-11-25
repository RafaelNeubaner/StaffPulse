import { describe, expect, it } from 'vitest';
import { createEmployeeStore } from '../../src/js/employee-store.js';
import {
  EMPLOYEE_STORAGE_KEY,
  PersistenceError,
  StorageError,
} from '../../src/js/employee-repository.js';

const employeeData = {
  name: 'Fernanda Oliveira',
  email: 'fernanda.oliveira@staffpulse.com',
  salary: 6500,
  admissionDate: '2022-03-10',
  department: 'TI',
  role: 'Engenheira de Software',
  status: 'ativo',
};

function createMemoryStorage(initialValue = null) {
  const records = new Map();

  if (initialValue !== null) {
    records.set(EMPLOYEE_STORAGE_KEY, initialValue);
  }

  return {
    getItem(key) {
      return records.has(key) ? records.get(key) : null;
    },
    setItem(key, value) {
      records.set(key, value);
    },
  };
}

describe('Employee store', () => {
  it('should add and persist an employee while preserving the generated identifier', () => {
    const storage = createMemoryStorage();
    const store = createEmployeeStore(storage);

    const employees = store.addEmployee(employeeData);
    const storedEmployees = JSON.parse(storage.getItem(EMPLOYEE_STORAGE_KEY));

    expect(employees).toHaveLength(1);
    expect(employees[0].id).toBeDefined();
    expect(storedEmployees).toEqual([...employees]);
  });

  it('should restore persisted employees and retain their identifiers', () => {
    const storage = createMemoryStorage();
    const initialStore = createEmployeeStore(storage);
    const created = initialStore.addEmployee({ ...employeeData, id: 'emp-preserved' });

    const restoredStore = createEmployeeStore(storage);

    expect(restoredStore.getEmployees()).toEqual(created);
    expect(restoredStore.getEmployees()[0].id).toBe('emp-preserved');
  });

  it('should update and physically or logically remove employees', () => {
    const storage = createMemoryStorage();
    const store = createEmployeeStore(storage);
    store.addEmployee({ ...employeeData, id: 'emp-1' });

    const updated = store.editEmployee('emp-1', { salary: 8200 });
    expect(updated[0].salary).toBe(8200);
    expect(updated[0].id).toBe('emp-1');
    expect(JSON.parse(storage.getItem(EMPLOYEE_STORAGE_KEY))).toEqual([...updated]);

    const inactive = store.removeEmployee('emp-1', { logical: true });
    expect(inactive[0].status).toBe('inativo');

    const removed = store.removeEmployee('emp-1');
    expect(removed).toHaveLength(0);
  });

  it('should notify subscribers after employee changes and stop after unsubscribe', () => {
    const store = createEmployeeStore(createMemoryStorage());
    const observedCounts = [];
    const unsubscribe = store.subscribe((employees) => observedCounts.push(employees.length));

    store.addEmployee({ ...employeeData, id: 'emp-1' });
    store.editEmployee('emp-1', { salary: 7000 });
    store.removeEmployee('emp-1');
    unsubscribe();
    store.addEmployee({ ...employeeData, id: 'emp-2' });

    expect(observedCounts).toEqual([1, 1, 0]);
  });

  it('should search, filter, sort, and calculate statistics through the store', () => {
    const store = createEmployeeStore(createMemoryStorage());
    store.addEmployee({ ...employeeData, id: 'emp-1' });
    store.addEmployee({
      ...employeeData,
      id: 'emp-2',
      name: 'Amanda Costa',
      email: 'amanda@staffpulse.com',
      salary: 4500,
      department: 'RH',
      status: 'inativo',
    });

    expect(store.findEmployees('fernanda')).toHaveLength(1);
    expect(store.filterEmployees({ department: 'RH', status: 'inativo' })).toHaveLength(1);
    expect(store.sortEmployees('salary', 'asc')[0].id).toBe('emp-2');
    expect(store.getPayrollStats()).toMatchObject({
      totalPayroll: 11000,
      averageSalary: 5500,
      totalEmployees: 2,
      activeEmployees: 1,
    });
  });

  it('should preserve state when persistence fails', () => {
    const failingStorage = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('storage unavailable');
      },
    };
    const failingStore = createEmployeeStore(failingStorage);

    expect(() => failingStore.addEmployee({ ...employeeData, id: 'emp-1' })).toThrow(
      'Não foi possível persistir os colaboradores.'
    );
    expect(failingStore.getEmployees()).toHaveLength(1);

    expect(() => failingStore.editEmployee('emp-1', { salary: 7000 })).toThrow(
      'Não foi possível persistir os colaboradores.'
    );
    expect(failingStore.getEmployees()[0].salary).toBe(7000);
  });

  it('should expose storage corruption and persistence errors consistently', () => {
    const corruptedStore = createEmployeeStore(createMemoryStorage('{invalid'));
    expect(corruptedStore.getStorageError()).toBeInstanceOf(StorageError);
    expect(corruptedStore.getEmployees()).toEqual([]);

    const failingStorage = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('storage unavailable');
      },
    };
    const failingStore = createEmployeeStore(failingStorage);

    let persistenceError;
    try {
      failingStore.addEmployee(employeeData);
    } catch (error) {
      persistenceError = error;
    }

    expect(persistenceError).toBeInstanceOf(PersistenceError);
    expect(failingStore.getEmployees()).toHaveLength(1);
    expect(failingStore.getStorageError()).toBeInstanceOf(PersistenceError);
  });
});
