const notificationDurations = {
  success: 5000,
  warning: 8000,
  error: 0,
};

let notificationRegion = null;
let dismissalTimer = null;

export function initializeNotifications(region = document.querySelector('#notification-region')) {
  if (!region) {
    throw new Error('A região de notificações do StaffPulse está incompleta.');
  }

  clearDismissalTimer();
  notificationRegion = region;
  notificationRegion.replaceChildren();
  notificationRegion.hidden = true;
  notificationRegion.setAttribute('role', 'status');
  notificationRegion.setAttribute('aria-live', 'polite');
  notificationRegion.setAttribute('aria-atomic', 'true');
}

export function showNotification(message, { type = 'success' } = {}) {
  if (!notificationRegion) {
    throw new Error('O sistema de notificações do StaffPulse não foi inicializado.');
  }
  if (typeof message !== 'string' || !message.trim()) {
    throw new Error('A mensagem da notificação não pode ser vazia.');
  }
  if (!Object.hasOwn(notificationDurations, type)) {
    throw new Error(`O tipo de notificação "${type}" não é suportado.`);
  }

  clearDismissalTimer();
  notificationRegion.replaceChildren();
  notificationRegion.dataset.type = type;
  notificationRegion.setAttribute('role', type === 'success' ? 'status' : 'alert');
  notificationRegion.setAttribute(
    'aria-live',
    type === 'success' ? 'polite' : 'assertive'
  );
  notificationRegion.setAttribute('aria-atomic', 'true');
  notificationRegion.hidden = false;

  const messageElement = document.createElement('p');
  messageElement.className = 'notification__message';
  messageElement.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.className = 'notification__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Fechar notificação');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', dismissNotification);

  notificationRegion.append(messageElement, closeButton);

  const duration = notificationDurations[type];
  if (duration > 0) {
    dismissalTimer = setTimeout(dismissNotification, duration);
  }
}

export function dismissNotification() {
  clearDismissalTimer();
  if (!notificationRegion) {
    return;
  }

  notificationRegion.replaceChildren();
  notificationRegion.hidden = true;
  delete notificationRegion.dataset.type;
}

function clearDismissalTimer() {
  if (dismissalTimer !== null) {
    clearTimeout(dismissalTimer);
    dismissalTimer = null;
  }
}
