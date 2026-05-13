import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initTheme } from '../src/theme.js';

describe('initTheme', () => {
    let themeToggle;
    let matchMediaListeners;

    beforeEach(() => {
        localStorage.clear();
        matchMediaListeners = {};

        document.documentElement.removeAttribute('data-theme');

        themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        document.body.appendChild(themeToggle);

        globalThis.matchMedia = vi.fn((query) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn((event, listener) => {
                matchMediaListeners[event] = listener;
            }),
            removeEventListener: vi.fn(),
        }));
    });

    afterEach(() => {
        themeToggle.remove();
        document.documentElement.removeAttribute('data-theme');
        document.body.style.overflow = '';
        vi.restoreAllMocks();
    });

    it('sets initial theme from localStorage', () => {
        localStorage.setItem('theme', 'light');
        initTheme(document.documentElement, vi.fn());
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('falls back to dark when prefers-color-scheme is dark', () => {
        globalThis.matchMedia = vi.fn((query) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        initTheme(document.documentElement, vi.fn());
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('falls back to light when prefers-color-scheme is light', () => {
        globalThis.matchMedia = vi.fn((query) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        initTheme(document.documentElement, vi.fn());
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('click on themeToggle toggles data-theme', () => {
        initTheme(document.documentElement, vi.fn());
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        themeToggle.click();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('click persists to localStorage', () => {
        initTheme(document.documentElement, vi.fn());
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.click();
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('dblclick on themeToggle calls eeShowSolarizedDialog callback', () => {
        const callback = vi.fn();
        initTheme(document.documentElement, callback);
        const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
        themeToggle.dispatchEvent(dblClickEvent);
        expect(callback).toHaveBeenCalledOnce();
    });

    it('dblclick calls e.preventDefault()', () => {
        const callback = vi.fn();
        initTheme(document.documentElement, callback);
        const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
        const preventDefaultSpy = vi.spyOn(dblClickEvent, 'preventDefault');
        themeToggle.dispatchEvent(dblClickEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('prefers-color-scheme change listener updates theme when no stored preference', () => {
        initTheme(document.documentElement, vi.fn());
        const changeListener = matchMediaListeners['change'];
        expect(changeListener).toBeTypeOf('function');
        changeListener({ matches: true });
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('prefers-color-scheme change listener sets light when matches false', () => {
        initTheme(document.documentElement, vi.fn());
        const changeListener = matchMediaListeners['change'];
        changeListener({ matches: false });
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('prefers-color-scheme change does not override stored preference', () => {
        localStorage.setItem('theme', 'light');
        initTheme(document.documentElement, vi.fn());
        const changeListener = matchMediaListeners['change'];
        changeListener({ matches: true });
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('does not crash when themeToggle is absent', () => {
        themeToggle.remove();
        expect(() => initTheme(document.documentElement, vi.fn())).not.toThrow();
    });
});
