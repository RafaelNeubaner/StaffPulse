import { describe, it, expect } from 'vitest';
import { validateName, validateEmail } from '../../src/js/validators.js';

describe('Módulo de Validações (validators.js)', () => {
  describe('validateName', () => {
    it('should return true when given a valid name with at least 3 letters and accents', () => {
      // Given
      const validName = 'João da Silva';
      // When
      const result = validateName(validName);
      // Then
      expect(result).toBe(true);
    });

    it('should throw an error when given an empty name or shorter than 3 characters', () => {
      // Given
      const emptyName = '   ';
      const shortName = 'Li';
      // When / Then
      expect(() => validateName(emptyName)).toThrow('O nome é obrigatório.');
      expect(() => validateName(shortName)).toThrow('O nome deve possuir no mínimo 3 caracteres.');
    });

    it('should throw an error when given a name containing numbers or special symbols', () => {
      // Given
      const nameWithNumbers = 'Carlos 123';
      const nameWithSymbols = 'Ana@ Costa!';
      // When / Then
      expect(() => validateName(nameWithNumbers)).toThrow('O nome deve conter apenas letras.');
      expect(() => validateName(nameWithSymbols)).toThrow('O nome deve conter apenas letras.');
    });
  });

  describe('validateEmail', () => {
    it('should return true when given a valid corporate email address', () => {
      // Given
      const corporateEmail = 'mariana.souza@staffpulse.com.br';
      // When
      const result = validateEmail(corporateEmail);
      // Then
      expect(result).toBe(true);
    });

    it('should throw an error when given an empty or non-string email input', () => {
      // Given
      const emptyEmail = '';
      // When / Then
      expect(() => validateEmail(emptyEmail)).toThrow('O e-mail é obrigatório.');
      expect(() => validateEmail(null)).toThrow('O e-mail é obrigatório.');
    });

    it('should throw an error when given a malformed email without @ or valid domain', () => {
      // Given
      const missingAt = 'usuario.empresa.com';
      const invalidDomain = 'usuario@empresa';
      // When / Then
      expect(() => validateEmail(missingAt)).toThrow('Formato de e-mail corporativo inválido.');
      expect(() => validateEmail(invalidDomain)).toThrow('Formato de e-mail corporativo inválido.');
    });
  });
});
