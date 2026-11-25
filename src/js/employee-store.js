import {
  calculatePayrollStats,
  createEmployee,
  deleteEmployee,
  filterEmployees,
  searchByName,
  sortEmployees,
  updateEmployee,
} from './employee-service.js';

let employees = Object.freeze([]);

export function getEmployees() {
  return employees;
}

export function addEmployee(employeeData) {
  employees = createEmployee(employeeData, employees);
  return getEmployees();
}

export function editEmployee(id, updates) {
  employees = updateEmployee(id, updates, employees);
  return getEmployees();
}

export function removeEmployee(id, options) {
  employees = deleteEmployee(id, employees, options);
  return getEmployees();
}

export function findEmployees(query) {
  return searchByName(employees, query);
}

export function filterStoredEmployees(criteria) {
  return filterEmployees(employees, criteria);
}

export function sortStoredEmployees(sortBy, order) {
  return sortEmployees(employees, sortBy, order);
}

export function getPayrollStats() {
  return calculatePayrollStats(employees);
}
