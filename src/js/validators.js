/**
 * Garante nome não vazio, mínimo de 3 caracteres e apenas letras e espaços.
 * @param {string} name
 * @returns {boolean}
 */
export function validateName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('O nome é obrigatório.');
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    throw new Error('O nome deve possuir no mínimo 3 caracteres.');
  }

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  if (!nameRegex.test(trimmed)) {
    throw new Error('O nome deve conter apenas letras.');
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
    throw new Error('O e-mail é obrigatório.');
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error('Formato de e-mail corporativo inválido.');
  }

  return true;
}

/**
 * Valida números positivos acima ou iguais ao piso mínimo legal (R$ 1412,00 por padrão).
 * @param {number|string} salary
 * @param {number} [minWage=1412]
 * @returns {boolean}
 */
export function validateSalary(salary, minWage = 1412) {
  if (
    salary === null ||
    salary === undefined ||
    typeof salary === 'boolean' ||
    (typeof salary === 'string' && salary.trim() === '')
  ) {
    throw new Error('O salário é obrigatório e deve ser numérico.');
  }

  const numericSalary = Number(salary);
  if (!Number.isFinite(numericSalary)) {
    throw new Error('O salário deve ser um número válido.');
  }

  if (numericSalary <= 0) {
    throw new Error('O salário deve ser um número positivo.');
  }

  if (numericSalary < minWage) {
    throw new Error(`O salário não pode ser inferior ao piso mínimo legal (${minWage}).`);
  }

  return true;
}
