export const EMPLOYEE_STORAGE_KEY = 'staffpulse.employees';

export class StorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

export class PersistenceError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'PersistenceError';
    this.cause = cause;
  }
}

export function getBrowserStorage() {
  try {
    if (typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadEmployeeRecords(storage) {
  if (!storage) {
    return [];
  }

  let serializedRecords;
  try {
    serializedRecords = storage.getItem(EMPLOYEE_STORAGE_KEY);
  } catch (error) {
    throw new StorageError('Não foi possível acessar os colaboradores armazenados.', error);
  }

  if (serializedRecords === null) {
    return [];
  }

  let records;
  try {
    records = JSON.parse(serializedRecords);
  } catch (error) {
    throw new StorageError('Os colaboradores armazenados estão corrompidos.', error);
  }

  if (!Array.isArray(records)) {
    throw new StorageError('Os dados armazenados não possuem o formato esperado.');
  }

  return records;
}

export function saveEmployeeRecords(storage, employees) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    throw new PersistenceError('Não foi possível persistir os colaboradores.', error);
  }
}
