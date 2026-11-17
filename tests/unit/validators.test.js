import { describe, it, expect } from 'vitest';
import { validateName, validateEmail, validateSalary } from '../../src/js/validators.js';

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

  describe('validateSalary', () => {
    it('should return true when given a salary equal to or above the minimum legal wage', () => {
      // Given
      const exactMinWage = 1412;
      const higherSalary = 5500.5;
      // When / Then
      expect(validateSalary(exactMinWage)).toBe(true);
      expect(validateSalary(higherSalary)).toBe(true);
    });

    it('should throw an error when given a negative, zero, or below minimum legal wage salary', () => {
      // Given
      const negativeSalary = -500;
      const zeroSalary = 0;
      const belowMinWage = 1411.99;
      // When / Then
      expect(() => validateSalary(negativeSalary)).toThrow('O salário deve ser um número positivo.');
      expect(() => validateSalary(zeroSalary)).toThrow('O salário deve ser um número positivo.');
      expect(() => validateSalary(belowMinWage)).toThrow('O salário não pode ser inferior ao piso mínimo legal');
    });

    it('should throw an error when given non-numeric, empty, or NaN salary values', () => {
      // Given
      const invalidString = 'mil reais';
      // When / Then
      expect(() => validateSalary(invalidString)).toThrow('O salário deve ser um número válido.');
      expect(() => validateSalary('')).toThrow('O salário é obrigatório e deve ser numérico.');
      expect(() => validateSalary(null)).toThrow('O salário é obrigatório e deve ser numérico.');
    });
  });
});
