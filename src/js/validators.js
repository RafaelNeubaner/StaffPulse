export const ALLOWED_DEPARTMENTS = Object.freeze(['TI', 'RH', 'Vendas', 'Financeiro']);
export const ALLOWED_STATUSES = Object.freeze(['ativo', 'inativo']);
export const MIN_LEGAL_SALARY = 1412;

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const EMAIL_REGEX = /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Garante nome não vazio, mínimo de 3 caracteres e apenas letras e espaços.
 * @param {string} name
 * @returns {boolean}
 */
export function validateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('name', 'O nome é obrigatório.');
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    throw new ValidationError('name', 'O nome deve possuir no mínimo 3 caracteres.');
  }

  if (!NAME_REGEX.test(trimmed)) {
    throw new ValidationError('name', 'O nome deve conter apenas letras.');
  }

  return true;
}

/**
 * Valida estrutura de e-mail corporativo (regex e domínio válido).
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new ValidationError('email', 'O e-mail é obrigatório.');
  }

  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new ValidationError('email', 'Formato de e-mail corporativo inválido.');
  }

  return true;
}

/**
 * Valida números positivos acima ou iguais ao piso mínimo legal (R$ 1412,00 por padrão).
 * @param {number|string} salary
 * @param {number} [minWage=MIN_LEGAL_SALARY]
 * @returns {boolean}
 */
export function validateSalary(salary, minWage = MIN_LEGAL_SALARY) {
  if (
    salary === null ||
    salary === undefined ||
    typeof salary === 'boolean' ||
    (typeof salary === 'string' && salary.trim() === '')
  ) {
    throw new ValidationError('salary', 'O salário é obrigatório e deve ser numérico.');
  }

  const numericSalary = Number(salary);
  if (!Number.isFinite(numericSalary)) {
    throw new ValidationError('salary', 'O salário deve ser um número válido.');
  }

  if (numericSalary <= 0) {
    throw new ValidationError('salary', 'O salário deve ser um número positivo.');
  }

  if (numericSalary < minWage) {
    throw new ValidationError(
      'salary',
      `O salário não pode ser inferior ao piso mínimo legal (${minWage}).`
    );
  }

  return true;
}

/**
 * Impede datas futuras e valida formato cronológico (YYYY-MM-DD).
 * @param {string} date
 * @returns {boolean}
 */
export function validateAdmissionDate(date) {
  if (typeof date !== 'string' || date.trim().length === 0) {
    throw new ValidationError('admissionDate', 'A data de admissão é obrigatória.');
  }

  const trimmed = date.trim();
  const match = trimmed.match(ISO_DATE_REGEX);
  if (!match) {
    throw new ValidationError(
      'admissionDate',
      'A data de admissão deve estar no formato cronológico YYYY-MM-DD.'
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() + 1 !== month ||
    parsedDate.getUTCDate() !== day ||
    year < 1900
  ) {
    throw new ValidationError(
      'admissionDate',
      'A data de admissão informada é calendariamente inválida.'
    );
  }

  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsedDate.getTime() > todayUTC) {
    throw new ValidationError(
      'admissionDate',
      'A data de admissão não pode ser uma data futura.'
    );
  }

  return true;
}

/**
 * Valida contra lista pré-aprovada de setores (TI, RH, Vendas, Financeiro).
 * @param {string} dept
 * @returns {boolean}
 */
export function validateDepartment(dept) {
  if (typeof dept !== 'string' || dept.trim().length === 0) {
    throw new ValidationError('department', 'O departamento é obrigatório.');
  }

  const trimmed = dept.trim();
  if (!ALLOWED_DEPARTMENTS.includes(trimmed)) {
    throw new ValidationError(
      'department',
      `Departamento inválido. Os setores permitidos são: ${ALLOWED_DEPARTMENTS.join(', ')}.`
    );
  }

  return true;
}

/**
 * Garante que o status do colaborador seja ativo ou inativo.
 * @param {string} status
 * @returns {boolean}
 */
export function validateStatus(status) {
  if (typeof status !== 'string' || status.trim().length === 0) {
    throw new ValidationError('status', 'O status é obrigatório.');
  }

  const normalizedStatus = status.trim().toLowerCase();
  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    throw new ValidationError(
      'status',
      `Status inválido. Os valores permitidos são: ${ALLOWED_STATUSES.join(', ')}.`
    );
  }

  return true;
}
