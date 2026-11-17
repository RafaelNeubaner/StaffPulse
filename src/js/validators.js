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
