import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildAboutPanel, buildMenuItems } from '../../../src/ee/context-menu/panel.js';

describe('context-menu/panel', () => {
    let eeManager;
    let t;
    let showToast;
    let html;

    beforeEach(() => {
        document.body.innerHTML = '';
        html = document.documentElement;
        html.setAttribute('data-ee-theme', 'cyberpunk');

        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn(() => 0.5),
            getVisitCount: vi.fn(() => 42),
        };
        t = vi.fn((key) => {
            const map = {
                ee_menu_about: 'About',
                ee_menu_source: 'Source',
                ee_menu_print: 'Print',
                ee_menu_theme_off: 'Theme Off',
                ee_menu_theme_on: 'Theme On',
                ee_menu_exit: 'Exit',
                ee_modal_title: 'About MILINSKY.OS',
                ee_modal_ok: 'OK',
                ee_toast_console: 'Check console',
                ee_toast_cyber_off: 'Cyberpunk off',
                ee_toast_cyber_on: 'Cyberpunk on',
                ee_toast_exit: 'Nice try',
            };
            return map[key] ?? key;
        });
        showToast = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        html.removeAttribute('data-ee-theme');
    });

    describe('buildAboutPanel', () => {
        it('creates overlay with modal structure', () => {
            const overlay = buildAboutPanel(t, eeManager);
            expect(overlay.className).toBe('ee-modal-overlay');
            expect(overlay.querySelector('.ee-about-modal')).not.toBeNull();
            expect(overlay.querySelector('.ee-about-modal__header')).not.toBeNull();
            expect(overlay.querySelector('.ee-about-modal__body')).not.toBeNull();
            expect(overlay.querySelector('.ee-about-modal__close')).not.toBeNull();
        });

        it('appends overlay to document body', () => {
            buildAboutPanel(t, eeManager);
            expect(document.querySelector('.ee-modal-overlay')).not.toBeNull();
        });

        it('shows system info in body', () => {
            buildAboutPanel(t, eeManager);
            const body = document.querySelector('.ee-about-modal__body');
            expect(body.textContent).toContain('MILINSKY.OS v4.2.0');
            expect(body.textContent).toContain('PHP 8.4+');
            expect(body.textContent).toContain('OPERATIONAL');
        });

        it('shows visit count from eeManager', () => {
            buildAboutPanel(t, eeManager);
            const body = document.querySelector('.ee-about-modal__body');
            expect(body.textContent).toContain('42 visits');
        });

        it('close button removes overlay', () => {
            buildAboutPanel(t, eeManager);
            const closeBtn = document.querySelector('.ee-about-modal__close');
            closeBtn.click();
            expect(document.querySelector('.ee-modal-overlay')).toBeNull();
        });

        it('clicking overlay background removes it', () => {
            const overlay = buildAboutPanel(t, eeManager);
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: overlay });
            overlay.dispatchEvent(clickEvent);
            expect(document.querySelector('.ee-modal-overlay')).toBeNull();
        });

        it('header shows translated title', () => {
            buildAboutPanel(t, eeManager);
            const hdr = document.querySelector('.ee-about-modal__header');
            expect(hdr.textContent).toBe('About MILINSKY.OS');
        });

        it('close button has type button', () => {
            buildAboutPanel(t, eeManager);
            const closeBtn = document.querySelector('.ee-about-modal__close');
            expect(closeBtn.type).toBe('button');
        });
    });

    describe('buildMenuItems', () => {
        function createConfig(overrides = {}) {
            return {
                t,
                html,
                eeManager,
                showToast,
                printResume: null,
                closeMenu: vi.fn(),
                schedule: vi.fn((fn, delay) => setTimeout(fn, delay)),
                sessionSeed: 0.5,
                ...overrides,
            };
        }

        it('returns 5 base items with sessionSeed 0.5', () => {
            const items = buildMenuItems(createConfig());
            expect(items.length).toBe(6);
        });

        it('includes about item with correct label', () => {
            const items = buildMenuItems(createConfig());
            const about = items.find((i) => i.label === 'About');
            expect(about).toBeDefined();
        });

        it('about item action calls closeMenu and opens panel', () => {
            const config = createConfig();
            const items = buildMenuItems(config);
            const about = items.find((i) => i.label === 'About');
            about.action();
            expect(config.closeMenu).toHaveBeenCalled();
            expect(document.querySelector('.ee-modal-overlay')).not.toBeNull();
        });

        it('source item action calls closeMenu and showToast', () => {
            const config = createConfig();
            const items = buildMenuItems(config);
            const source = items.find((i) => i.label === 'Source');
            source.action();
            expect(config.closeMenu).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith('Check console', 3000);
        });

        it('exit item action calls closeMenu and showToast', () => {
            const config = createConfig();
            const items = buildMenuItems(config);
            const exit = items.find((i) => i.label === 'Exit');
            exit.action();
            expect(config.closeMenu).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith('Nice try', 3000);
        });

        it('print item calls window.print when no printResume', () => {
            window.print = vi.fn();
            const config = createConfig();
            const items = buildMenuItems(config);
            const print = items.find((i) => i.label === 'Print');
            print.action();
            expect(window.print).toHaveBeenCalled();
        });

        it('print item calls printResume when provided', () => {
            const mockPrintResume = vi.fn();
            const config = createConfig({ printResume: mockPrintResume });
            const items = buildMenuItems(config);
            const print = items.find((i) => i.label === 'Print');
            print.action();
            expect(mockPrintResume).toHaveBeenCalledOnce();
        });

        it('theme toggle removes cyberpunk when active', () => {
            const config = createConfig();
            const items = buildMenuItems(config);
            const theme = items.find((i) => i.label === 'Theme Off');
            theme.action();
            expect(html.getAttribute('data-ee-theme')).toBeNull();
            expect(showToast).toHaveBeenCalledWith('Cyberpunk off', 2000);
        });

        it('theme toggle adds cyberpunk when inactive', () => {
            html.removeAttribute('data-ee-theme');
            const config = createConfig();
            const items = buildMenuItems(config);
            const theme = items.find((i) => i.label === 'Theme On');
            theme.action();
            expect(html.getAttribute('data-ee-theme')).toBe('cyberpunk');
            expect(showToast).toHaveBeenCalledWith('Cyberpunk on', 2000);
        });

        it('includes self-destruct when sessionSeed > 0.5', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.6 }));
            const sd = items.find((i) => i.label === '> Self-destruct');
            expect(sd).toBeDefined();
        });

        it('excludes self-destruct when sessionSeed <= 0.5', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.5 }));
            const sd = items.find((i) => i.label === '> Self-destruct');
            expect(sd).toBeUndefined();
        });

        it('self-destruct action sets body opacity to 0', () => {
            vi.useFakeTimers();
            const config = createConfig({ sessionSeed: 0.6 });
            const items = buildMenuItems(config);
            const sd = items.find((i) => i.label === '> Self-destruct');
            sd.action();
            expect(document.body.style.opacity).toBe('0');
            vi.advanceTimersByTime(2000);
            expect(document.body.style.opacity).toBe('1');
            vi.useRealTimers();
        });

        it('includes coffee break when sessionSeed between 0.3 and 0.7', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.5 }));
            const coffee = items.find((i) => i.label === '> Coffee break');
            expect(coffee).toBeDefined();
        });

        it('excludes coffee break when sessionSeed <= 0.3', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.2 }));
            const coffee = items.find((i) => i.label === '> Coffee break');
            expect(coffee).toBeUndefined();
        });

        it('excludes coffee break when sessionSeed >= 0.7', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.7 }));
            const coffee = items.find((i) => i.label === '> Coffee break');
            expect(coffee).toBeUndefined();
        });

        it('coffee break action calls closeMenu and showToast', () => {
            const config = createConfig({ sessionSeed: 0.5 });
            const items = buildMenuItems(config);
            const coffee = items.find((i) => i.label === '> Coffee break');
            coffee.action();
            expect(config.closeMenu).toHaveBeenCalled();
            expect(showToast).toHaveBeenCalledWith('(\\\n  \\)_  coffee\n   |_(\n', 5000);
        });

        it('returns only 5 items when no seed-based items qualify', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.1 }));
            expect(items.length).toBe(5);
        });

        it('returns 7 items when both seed-based items qualify', () => {
            const items = buildMenuItems(createConfig({ sessionSeed: 0.6 }));
            expect(items.length).toBe(7);
        });
    });
});
