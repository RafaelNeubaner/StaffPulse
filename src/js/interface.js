import { getEmployees, getStorageError } from './employee-store.js';

export function initializeInterface() {
  const employeeCount = document.querySelector('#employee-count');
  const storageStatus = document.querySelector('#storage-status');

  if (!employeeCount) {
    throw new Error('Elemento da interface "#employee-count" não encontrado.');
  }

  renderEmployeeCount(employeeCount);
  renderStorageStatus(storageStatus);
}

function renderEmployeeCount(container) {
  const total = getEmployees().length;
  container.textContent =
    total === 0
      ? 'Nenhum colaborador cadastrado.'
      : `${total} colaborador${total === 1 ? '' : 'es'} cadastrado${total === 1 ? '' : 's'}.`;
}

function renderStorageStatus(container) {
  if (!container) {
    return;
  }

  const storageError = getStorageError();
  container.textContent = storageError ? storageError.message : '';
}
