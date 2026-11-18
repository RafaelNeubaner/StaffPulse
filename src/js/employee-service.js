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

/**
 * Atualiza dados cadastrais existentes garantindo imutabilidade.
 * @param {string} id
 * @param {object} updates
 * @param {Array<object>} [store=[]]
 * @returns {Array<object>}
 */
export function updateEmployee(id, updates, store = []) {
  if (!id || typeof id !== 'string') {
    throw new Error('ID do colaborador é obrigatório.');
  }
  if (!updates || typeof updates !== 'object') {
    throw new Error('Dados de atualização são obrigatórios.');
  }
  if (!Array.isArray(store)) {
    throw new Error('O store deve ser uma lista válida.');
  }

  const index = store.findIndex((emp) => emp.id === id);
  if (index === -1) {
    throw new Error('Colaborador não encontrado.');
  }

  const current = store[index];
  const merged = {
    ...current,
    ...updates,
    id: current.id,
  };

  validateName(merged.name);
  validateEmail(merged.email);
  validateSalary(merged.salary);
  validateAdmissionDate(merged.admissionDate);
  validateDepartment(merged.department);

  const updatedEmployee = Object.freeze({
    id: current.id,
    name: merged.name.trim(),
    email: merged.email.trim(),
    salary: Number(merged.salary),
    admissionDate: merged.admissionDate.trim(),
    department: merged.department.trim(),
    role: merged.role ? String(merged.role).trim() : current.role,
    status: merged.status ? String(merged.status).trim().toLowerCase() : current.status,
  });

  return Object.freeze(
    store.map((emp, idx) => (idx === index ? updatedEmployee : Object.freeze({ ...emp })))
  );
}

/**
 * Executa a remoção lógica ou física do registro.
 * @param {string} id
 * @param {Array<object>} [store=[]]
 * @param {{ logical?: boolean } | boolean} [options={ logical: false }]
 * @returns {Array<object>}
 */
export function deleteEmployee(id, store = [], options = { logical: false }) {
  if (!id || typeof id !== 'string') {
    throw new Error('ID do colaborador é obrigatório.');
  }
  if (!Array.isArray(store)) {
    throw new Error('O store deve ser uma lista válida.');
  }

  const index = store.findIndex((emp) => emp.id === id);
  if (index === -1) {
    throw new Error('Colaborador não encontrado.');
  }

  const isLogical = typeof options === 'boolean' ? options : Boolean(options && options.logical);

  if (isLogical) {
    return Object.freeze(
      store.map((emp, idx) =>
        idx === index ? Object.freeze({ ...emp, status: 'inativo' }) : Object.freeze({ ...emp })
      )
    );
  }

  return Object.freeze(
    store.filter((emp) => emp.id !== id).map((emp) => Object.freeze({ ...emp }))
  );
}

/**
 * Filtro combinado por departamento e status (ativo/inativo).
 * @param {Array<object>} list
 * @param {{ department?: string, status?: string }} [criteria={}]
 * @returns {Array<object>}
 */
export function filterEmployees(list = [], criteria = {}) {
  if (!Array.isArray(list)) {
    throw new Error('A lista de colaboradores deve ser um array válido.');
  }

  const { department, status } = criteria || {};
  const normalizedDept = department && typeof department === 'string' ? department.trim() : '';
  const normalizedStatus =
    status && typeof status === 'string' ? status.trim().toLowerCase() : '';

  return list.filter((emp) => {
    const matchesDept =
      !normalizedDept ||
      normalizedDept.toLowerCase() === 'todos' ||
      normalizedDept.toLowerCase() === 'all' ||
      emp.department === normalizedDept;

    const matchesStatus =
      !normalizedStatus ||
      normalizedStatus === 'todos' ||
      normalizedStatus === 'all' ||
      String(emp.status || 'ativo').toLowerCase() === normalizedStatus;

    return matchesDept && matchesStatus;
  });
}
