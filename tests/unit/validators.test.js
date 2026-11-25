import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  validateSalary,
  validateAdmissionDate,
  validateDepartment,
  validateStatus,
  ValidationError,
} from '../../src/js/validators.js';

describe('Módulo de Validações (validators.js)', () => {
  it('should identify the field for errors from every validator', () => {
    const invalidValidations = [
      [() => validateName(''), 'name'],
      [() => validateEmail('invalid'), 'email'],
      [() => validateSalary('invalid'), 'salary'],
      [() => validateAdmissionDate('invalid'), 'admissionDate'],
      [() => validateDepartment('Marketing'), 'department'],
      [() => validateStatus('pendente'), 'status'],
    ];

    for (const [validate, field] of invalidValidations) {
      let thrownError;
      try {
        validate();
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ValidationError);
      expect(thrownError.field).toBe(field);
    }
  });

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

    it('should include the field name in validation errors', () => {
      let thrownError;

      try {
        validateName('');
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ValidationError);
      expect(thrownError).toMatchObject({
        field: 'name',
        message: 'O nome é obrigatório.',
      });
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

  describe('validateAdmissionDate', () => {
    it('should return true when given a valid past or current admission date in YYYY-MM-DD format', () => {
      // Given
      const pastDate = '2023-05-15';
      // When
      const result = validateAdmissionDate(pastDate);
      // Then
      expect(result).toBe(true);
    });

    it('should throw an error when given a future admission date', () => {
      // Given
      const futureDate = '2099-12-31';
      // When / Then
      expect(() => validateAdmissionDate(futureDate)).toThrow(
        'A data de admissão não pode ser uma data futura.'
      );
    });

    it('should throw an error when given an invalid date format or non-existent calendar date', () => {
      // Given
      const wrongFormat = '15/05/2023';
      const impossibleDay = '2023-02-30';
      // When / Then
      expect(() => validateAdmissionDate('')).toThrow('A data de admissão é obrigatória.');
      expect(() => validateAdmissionDate(wrongFormat)).toThrow(
        'A data de admissão deve estar no formato cronológico YYYY-MM-DD.'
      );
      expect(() => validateAdmissionDate(impossibleDay)).toThrow(
        'A data de admissão informada é calendariamente inválida.'
      );
    });
  });

  describe('validateDepartment', () => {
    it('should return true when given any of the pre-approved departments (TI, RH, Vendas, Financeiro)', () => {
      // Given
      const approved = ['TI', 'RH', 'Vendas', 'Financeiro'];
      // When / Then
      for (const sector of approved) {
        expect(validateDepartment(sector)).toBe(true);
      }
    });

    it('should throw an error when given an unapproved or unknown department', () => {
      // Given
      const unapprovedDept = 'Marketing';
      // When / Then
      expect(() => validateDepartment(unapprovedDept)).toThrow(
        'Departamento inválido. Os setores permitidos são: TI, RH, Vendas, Financeiro.'
      );
    });

    it('should throw an error when given an empty or non-string department value', () => {
      // Given
      const emptyDept = '   ';
      // When / Then
      expect(() => validateDepartment(emptyDept)).toThrow('O departamento é obrigatório.');
      expect(() => validateDepartment(undefined)).toThrow('O departamento é obrigatório.');
    });
  });

  describe('validateStatus', () => {
    it('should accept active and inactive statuses regardless of letter case', () => {
      expect(validateStatus('ativo')).toBe(true);
      expect(validateStatus('INATIVO')).toBe(true);
    });

    it('should throw a field-specific error for blank or unsupported statuses', () => {
      expect(() => validateStatus('')).toThrow('O status é obrigatório.');

      let thrownError;
      try {
        validateStatus('pendente');
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(ValidationError);
      expect(thrownError).toMatchObject({
        field: 'status',
        message: 'Status inválido. Os valores permitidos são: ativo, inativo.',
      });
    });
  });
});
