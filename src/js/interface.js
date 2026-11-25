import { getStorageError } from './employee-store.js';
import { initializeNotifications, showNotification } from './notifications.js';

export function initializeInterface() {
  const pageTitle = document.querySelector('#page-title');
  const navigationLinks = [...document.querySelectorAll('[data-page]')];
  const pageSections = [...document.querySelectorAll('[data-page-section]')];
  const notificationRegion = document.querySelector('#notification-region');

  if (!pageTitle || navigationLinks.length === 0 || pageSections.length === 0) {
    throw new Error('A estrutura de navegação do StaffPulse está incompleta.');
  }

  initializeNotifications(notificationRegion);

  const updateActivePage = () => {
    const requestedPage = window.location.hash.slice(1);
    const currentPage = pageSections.some((section) => section.dataset.pageSection === requestedPage)
      ? requestedPage
      : 'dashboard';

    const activeTitle =
      pageSections.find((section) => section.dataset.pageSection === currentPage)
        ?.querySelector('h2')
        ?.textContent ?? 'Dashboard';
    pageTitle.textContent = activeTitle;
    document.title = `StaffPulse | ${activeTitle}`;

    for (const link of navigationLinks) {
      if (link.dataset.page === currentPage) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }

    for (const section of pageSections) {
      section.hidden = section.dataset.pageSection !== currentPage;
    }
  };

  window.addEventListener('hashchange', updateActivePage);
  updateActivePage();
  const storageError = getStorageError();
  if (storageError) {
    showNotification(storageError.message, { type: 'error' });
  }
}
