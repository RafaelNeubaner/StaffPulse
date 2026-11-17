import { describe, it, expect } from 'vitest';
import { validateName } from '../../src/js/validators.js';

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
});
