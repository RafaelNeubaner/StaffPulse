import {
  calculatePayrollStats,
  createEmployee,
  deleteEmployee,
  filterEmployees,
  searchByName,
  sortEmployees,
  updateEmployee,
} from './employee-service.js';
import {
  getBrowserStorage,
  loadEmployeeRecords,
  saveEmployeeRecords,
} from './employee-repository.js';

export function createEmployeeStore(storage = getBrowserStorage()) {
  let employees = Object.freeze([]);
  let storageError = null;
  const subscribers = new Set();

  try {
    const persistedRecords = loadEmployeeRecords(storage);
    let normalizedEmployees = Object.freeze([]);

    for (const record of persistedRecords) {
      normalizedEmployees = createEmployee(record, normalizedEmployees);
    }

    employees = normalizedEmployees;
  } catch (error) {
    storageError = error;
  }

  function persist(nextEmployees) {
    employees = nextEmployees;

    try {
      saveEmployeeRecords(storage, nextEmployees);
    } catch (error) {
      storageError = error;
      notifySubscribers();
      throw error;
    }

    storageError = null;
    notifySubscribers();
  }

  function notifySubscribers() {
    for (const subscriber of subscribers) {
      subscriber(employees);
    }
  }

  return {
    getEmployees() {
      return employees;
    },

    getStorageError() {
      return storageError;
    },

    subscribe(subscriber) {
      if (typeof subscriber !== 'function') {
        throw new Error('O ouvinte de alterações deve ser uma função.');
      }

      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },

    addEmployee(employeeData) {
      persist(createEmployee(employeeData, employees));
      storageError = null;
      return employees;
    },

    editEmployee(id, updates) {
      persist(updateEmployee(id, updates, employees));
      storageError = null;
      return employees;
    },

    removeEmployee(id, options) {
      persist(deleteEmployee(id, employees, options));
      storageError = null;
      return employees;
    },

    findEmployees(query) {
      return searchByName(employees, query);
    },

    filterEmployees(criteria) {
      return filterEmployees(employees, criteria);
    },

    sortEmployees(sortBy, order) {
      return sortEmployees(employees, sortBy, order);
    },

    getPayrollStats() {
      return calculatePayrollStats(employees);
    },
  };
}

export const employeeStore = createEmployeeStore();

export function getEmployees() {
  return employeeStore.getEmployees();
}

export function addEmployee(employeeData) {
  return employeeStore.addEmployee(employeeData);
}

export function editEmployee(id, updates) {
  return employeeStore.editEmployee(id, updates);
}

export function removeEmployee(id, options) {
  return employeeStore.removeEmployee(id, options);
}

export function findEmployees(query) {
  return employeeStore.findEmployees(query);
}

export function filterStoredEmployees(criteria) {
  return employeeStore.filterEmployees(criteria);
}

export function sortStoredEmployees(sortBy, order) {
  return employeeStore.sortEmployees(sortBy, order);
}

export function getPayrollStats() {
  return employeeStore.getPayrollStats();
}

export function getStorageError() {
  return employeeStore.getStorageError();
}

export function subscribeToEmployeeChanges(subscriber) {
  return employeeStore.subscribe(subscriber);
}
