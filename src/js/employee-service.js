import {
  validateName,
  validateEmail,
  validateSalary,
  validateAdmissionDate,
  validateDepartment,
} from './validators.js';

let idSequence = 1;

/**
 * Adiciona registro garantindo ID único e imutabilidade.
 * @param {object} data
 * @param {Array<object>} [store=[]]
 * @returns {Array<object>}
 */
export function createEmployee(data, store = []) {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados do colaborador são obrigatórios.');
  }
  if (!Array.isArray(store)) {
    throw new Error('O store deve ser uma lista válida.');
  }

  validateName(data.name);
  validateEmail(data.email);
  validateSalary(data.salary);
  validateAdmissionDate(data.admissionDate);
  validateDepartment(data.department);

  const generatedId = data.id ? String(data.id).trim() : `emp-${Date.now()}-${idSequence++}`;
  const idExists = store.some((emp) => emp.id === generatedId);
  if (idExists) {
    throw new Error('Já existe um colaborador com este ID.');
  }

  const newEmployee = Object.freeze({
    id: generatedId,
    name: data.name.trim(),
    email: data.email.trim(),
    salary: Number(data.salary),
    admissionDate: data.admissionDate.trim(),
    department: data.department.trim(),
    role: data.role ? String(data.role).trim() : 'Analista',
    status: data.status ? String(data.status).trim().toLowerCase() : 'ativo',
  });

  return Object.freeze([...store.map((item) => Object.freeze({ ...item })), newEmployee]);
}
