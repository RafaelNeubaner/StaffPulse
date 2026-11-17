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
