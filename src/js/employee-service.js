import {
  validateName,
  validateEmail,
  validateSalary,
  validateAdmissionDate,
  validateDepartment,
} from './validators.js';

let idSequence = 1;

function normalizeEmployeeRecord(data, id) {
  validateName(data.name);
  validateEmail(data.email);
  validateSalary(data.salary);
  validateAdmissionDate(data.admissionDate);
  validateDepartment(data.department);

  return Object.freeze({
    id,
    name: data.name.trim(),
    email: data.email.trim(),
    salary: Number(data.salary),
    admissionDate: data.admissionDate.trim(),
    department: data.department.trim(),
    role: data.role ? String(data.role).trim() : 'Analista',
    status: data.status ? String(data.status).trim().toLowerCase() : 'ativo',
  });
}

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

  const generatedId = data.id ? String(data.id).trim() : `emp-${Date.now()}-${idSequence++}`;
  if (store.some((emp) => emp.id === generatedId)) {
    throw new Error('Já existe um colaborador com este ID.');
  }

  const newEmployee = normalizeEmployeeRecord(data, generatedId);
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
  const updatedEmployee = normalizeEmployeeRecord({ ...current, ...updates }, current.id);

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
 * Ordena a lista de colaboradores por campo e direção sem mutar a lista original.
 * @param {Array<object>} list
 * @param {'name' | 'salary' | 'admissionDate'} [sortBy='name']
 * @param {'asc' | 'desc'} [order='asc']
 * @returns {Array<object>}
 */
export function sortEmployees(list = [], sortBy = 'name', order = 'asc') {
  if (!Array.isArray(list)) {
    throw new Error('A lista de colaboradores deve ser um array válido.');
  }

  const direction = String(order).toLowerCase() === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => {
    if (sortBy === 'salary') {
      return (Number(a.salary) - Number(b.salary)) * direction;
    }
    if (sortBy === 'admissionDate') {
      return String(a.admissionDate).localeCompare(String(b.admissionDate)) * direction;
    }
    return String(a.name).localeCompare(String(b.name), 'pt-BR') * direction;
  });
}

/**
 * Filtro combinado por departamento e status (ativo/inativo), com suporte opcional a ordenação.
 * @param {Array<object>} list
 * @param {{ department?: string, status?: string, sortBy?: string, order?: 'asc' | 'desc' }} [criteria={}]
 * @returns {Array<object>}
 */
export function filterEmployees(list = [], criteria = {}) {
  if (!Array.isArray(list)) {
    throw new Error('A lista de colaboradores deve ser um array válido.');
  }

  const { department, status, sortBy, order = 'asc' } = criteria || {};
  const normalizedDept = department ? String(department).trim() : '';
  const normalizedStatus = status ? String(status).trim().toLowerCase() : '';

  const filtered = list.filter((emp) => {
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

  if (sortBy) {
    return sortEmployees(filtered, sortBy, order);
  }

  return filtered;
}

/**
 * Busca textual insensível a maiúsculas/minúsculas.
 * @param {Array<object>} list
 * @param {string} [query='']
 * @returns {Array<object>}
 */
export function searchByName(list = [], query = '') {
  if (!Array.isArray(list)) {
    throw new Error('A lista de colaboradores deve ser um array válido.');
  }

  if (typeof query !== 'string' || query.trim() === '') {
    return [...list];
  }

  const normalizedQuery = query.trim().toLowerCase();
  return list.filter((emp) => String(emp.name).toLowerCase().includes(normalizedQuery));
}

/**
 * Retorna soma total da folha, média salarial e contagem por cargo.
 * @param {Array<object>} list
 * @returns {{ totalPayroll: number, averageSalary: number, countByRole: Record<string, number>, totalEmployees: number, activeEmployees: number }}
 */
export function calculatePayrollStats(list = []) {
  if (!Array.isArray(list)) {
    throw new Error('A lista de colaboradores deve ser um array válido.');
  }

  if (list.length === 0) {
    return {
      totalPayroll: 0,
      averageSalary: 0,
      countByRole: {},
      totalEmployees: 0,
      activeEmployees: 0,
    };
  }

  let totalSalary = 0;
  let activeCount = 0;
  const countByRole = {};

  for (const emp of list) {
    totalSalary += Number(emp.salary);

    const roleKey = emp.role ? String(emp.role).trim() : 'Analista';
    countByRole[roleKey] = (countByRole[roleKey] || 0) + 1;

    if (String(emp.status || 'ativo').toLowerCase() === 'ativo') {
      activeCount += 1;
    }
  }

  const totalPayroll = Number(totalSalary.toFixed(2));
  const averageSalary = Number((totalSalary / list.length).toFixed(2));

  return {
    totalPayroll,
    averageSalary,
    countByRole,
    totalEmployees: list.length,
    activeEmployees: activeCount,
  };
}
