import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeInterface } from '../../src/js/interface.js';

function createLink(page) {
  const attributes = {};

  return {
    dataset: { page },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    removeAttribute(name) {
      delete attributes[name];
    },
    getAttribute(name) {
      return attributes[name] ?? null;
    },
  };
}

function createSection(page, title) {
  return {
    dataset: { pageSection: page },
    hidden: false,
    querySelector(selector) {
      return selector === 'h2' ? { textContent: title } : null;
    },
  };
}

function createInterfaceEnvironment(hash = '') {
  const pageTitle = { textContent: '' };
  const notificationRegion = { textContent: '', hidden: false };
  const links = [createLink('dashboard'), createLink('employees')];
  const sections = [
    createSection('dashboard', 'Dashboard'),
    createSection('employees', 'Colaboradores'),
  ];
  const listeners = new Map();
  const documentStub = {
    title: 'StaffPulse',
    querySelector(selector) {
      if (selector === '#page-title') return pageTitle;
      if (selector === '#notification-region') return notificationRegion;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-page]') return links;
      if (selector === '[data-page-section]') return sections;
      return [];
    },
  };
  const windowStub = {
    location: { hash },
    addEventListener(eventName, callback) {
      listeners.set(eventName, callback);
    },
  };

  vi.stubGlobal('document', documentStub);
  vi.stubGlobal('window', windowStub);

  return { documentStub, links, listeners, notificationRegion, pageTitle, sections, windowStub };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StaffPulse section navigation', () => {
  it('should open the Dashboard when no section is specified', () => {
    const { documentStub, links, pageTitle, sections } = createInterfaceEnvironment();

    initializeInterface();

    expect(pageTitle.textContent).toBe('Dashboard');
    expect(documentStub.title).toBe('StaffPulse | Dashboard');
    expect(sections[0].hidden).toBe(false);
    expect(sections[1].hidden).toBe(true);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].getAttribute('aria-current')).toBeNull();
  });

  it('should open a section directly and keep the active state in sync with navigation events', () => {
    const { documentStub, links, listeners, pageTitle, sections, windowStub } =
      createInterfaceEnvironment('#employees');

    initializeInterface();

    expect(pageTitle.textContent).toBe('Colaboradores');
    expect(documentStub.title).toBe('StaffPulse | Colaboradores');
    expect(sections[0].hidden).toBe(true);
    expect(sections[1].hidden).toBe(false);
    expect(links[1].getAttribute('aria-current')).toBe('page');

    windowStub.location.hash = '#dashboard';
    listeners.get('hashchange')();

    expect(pageTitle.textContent).toBe('Dashboard');
    expect(sections[0].hidden).toBe(false);
    expect(sections[1].hidden).toBe(true);
    expect(links[0].getAttribute('aria-current')).toBe('page');

    windowStub.location.hash = '#employees';
    listeners.get('hashchange')();
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(sections[1].hidden).toBe(false);
  });

  it('should fall back to Dashboard when the URL contains an unknown section', () => {
    const { pageTitle, sections, links } = createInterfaceEnvironment('#unknown');

    initializeInterface();

    expect(pageTitle.textContent).toBe('Dashboard');
    expect(sections[0].hidden).toBe(false);
    expect(sections[1].hidden).toBe(true);
    expect(links[0].getAttribute('aria-current')).toBe('page');
  });

  it('should report incomplete navigation markup instead of failing silently', () => {
    vi.stubGlobal('document', {
      title: 'StaffPulse',
      querySelector: () => null,
      querySelectorAll: () => [],
    });
    vi.stubGlobal('window', { location: { hash: '' }, addEventListener: vi.fn() });

    expect(() => initializeInterface()).toThrow(
      'A estrutura de navegação do StaffPulse está incompleta.'
    );
  });
});
