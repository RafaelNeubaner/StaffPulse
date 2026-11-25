import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dismissNotification,
  initializeNotifications,
  showNotification,
} from '../../src/js/notifications.js';

class ElementStub {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.attributes = {};
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
    this.hidden = false;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }
}

function setupNotifications() {
  const region = new ElementStub();
  vi.stubGlobal('document', { createElement: (tagName) => new ElementStub(tagName) });
  initializeNotifications(region);
  return region;
}

afterEach(() => {
  dismissNotification();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('StaffPulse notifications', () => {
  it('should announce success politely and dismiss it automatically', () => {
    vi.useFakeTimers();
    const region = setupNotifications();

    showNotification('Colaborador cadastrado com sucesso.');

    expect(region.hidden).toBe(false);
    expect(region.dataset.type).toBe('success');
    expect(region.attributes.role).toBe('status');
    expect(region.attributes['aria-live']).toBe('polite');
    expect(region.attributes['aria-atomic']).toBe('true');
    expect(region.children[0].textContent).toBe('Colaborador cadastrado com sucesso.');

    vi.advanceTimersByTime(5000);
    expect(region.hidden).toBe(true);
  });

  it('should keep errors visible until the user closes them', () => {
    vi.useFakeTimers();
    const region = setupNotifications();

    showNotification('Não foi possível persistir os colaboradores.', { type: 'error' });

    expect(region.attributes.role).toBe('alert');
    expect(region.attributes['aria-live']).toBe('assertive');
    expect(region.children[1].attributes['aria-label']).toBe('Fechar notificação');
    vi.advanceTimersByTime(30000);
    expect(region.hidden).toBe(false);

    region.children[1].listeners.get('click')();
    expect(region.hidden).toBe(true);
  });

  it('should announce validation warnings as alerts and replace prior notifications', () => {
    const region = setupNotifications();
    showNotification('Sucesso.', { type: 'success' });

    showNotification('Revise os campos destacados antes de continuar.', { type: 'warning' });

    expect(region.dataset.type).toBe('warning');
    expect(region.attributes.role).toBe('alert');
    expect(region.attributes['aria-live']).toBe('assertive');
    expect(region.children[0].textContent).toBe('Revise os campos destacados antes de continuar.');
  });
});
