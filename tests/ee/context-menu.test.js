import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createContextMenu } from '../../src/ee/context-menu.js';

describe('context-menu', () => {
    let eeManager;
    let t;
    let showToast;
    let html;
    let target;
    let destroyFn;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        html = document.documentElement;
        html.setAttribute('data-ee-theme', 'cyberpunk');

        target = document.createElement('div');
        target.id = 'test-target';
        document.body.appendChild(target);

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
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        vi.useRealTimers();
    });

    function init() {
        const result = createContextMenu({ eeManager, t, html, showToast });
        destroyFn = result.destroy;
        return result;
    }

    function fireContextMenu(x, y) {
        const event = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
        });
        target.dispatchEvent(event);
    }

    it('single right-click creates menu with .ee-cde-menu class', () => {
        init();
        fireContextMenu(100, 100);
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
    });

    it('contextmenu event is prevented', () => {
        init();
        const event = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
        });
        target.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });

    it('discover ee04 is called on menu creation', () => {
        init();
        fireContextMenu(100, 100);
        expect(eeManager.discover).toHaveBeenCalledWith('ee04');
    });

    it('menu is positioned at click coordinates', () => {
        init();
        fireContextMenu(150, 200);
        const menu = document.querySelector('.ee-cde-menu');
        expect(menu.style.left).toBe('150px');
        expect(menu.style.top).toBe('200px');
    });

    it('menu has header with MILINSKY.OS text', () => {
        init();
        fireContextMenu(100, 100);
        const header = document.querySelector('.ee-cde-menu__header');
        expect(header).not.toBeNull();
        expect(header.textContent).toBe('MILINSKY.OS');
    });

    it('menu items are shuffled - contains base items plus random', () => {
        init();
        fireContextMenu(100, 100);
        const items = document.querySelectorAll('.ee-cde-menu__item');
        expect(items.length).toBe(6);
    });

    it('clicking outside menu closes it', () => {
        init();
        fireContextMenu(100, 100);
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 500, clientY: 500 }));
        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('Escape key closes menu', () => {
        init();
        fireContextMenu(100, 100);
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('long press on touch creates menu', () => {
        init();
        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 200 }],
            bubbles: true,
        }));
        vi.advanceTimersByTime(500);
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
    });

    it('touch move cancels long press', () => {
        init();
        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 200 }],
            bubbles: true,
        }));
        target.dispatchEvent(new TouchEvent('touchmove', {
            touches: [{ clientX: 150, clientY: 250 }],
            bubbles: true,
        }));
        vi.advanceTimersByTime(500);
        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('touchend cancels long press timer', () => {
        init();
        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 200 }],
            bubbles: true,
        }));
        target.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        vi.advanceTimersByTime(500);
        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('about modal opens and closes with button', () => {
        init();
        fireContextMenu(100, 100);
        const aboutItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'About');
        aboutItem.click();
        const overlay = document.querySelector('.ee-modal-overlay');
        expect(overlay).not.toBeNull();
        const closeBtn = overlay.querySelector('.ee-about-modal__close');
        closeBtn.click();
        expect(document.querySelector('.ee-modal-overlay')).toBeNull();
    });

    it('about modal closes when clicking overlay background', () => {
        init();
        fireContextMenu(100, 100);
        const aboutItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'About');
        aboutItem.click();
        const overlay = document.querySelector('.ee-modal-overlay');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: overlay });
        overlay.dispatchEvent(clickEvent);
        expect(document.querySelector('.ee-modal-overlay')).toBeNull();
    });

    it('about modal shows visit count', () => {
        init();
        fireContextMenu(100, 100);
        const aboutItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'About');
        aboutItem.click();
        const body = document.querySelector('.ee-about-modal__body');
        expect(body.innerHTML).toContain('42 visits');
    });

    it('theme toggle removes cyberpunk when active', () => {
        init();
        fireContextMenu(100, 100);
        const themeItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Theme Off');
        themeItem.click();
        expect(html.getAttribute('data-ee-theme')).toBeNull();
        expect(showToast).toHaveBeenCalledWith('Cyberpunk off', 2000);
    });

    it('theme toggle adds cyberpunk when inactive', () => {
        html.removeAttribute('data-ee-theme');
        init();
        fireContextMenu(100, 100);
        const themeItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Theme On');
        themeItem.click();
        expect(html.getAttribute('data-ee-theme')).toBe('cyberpunk');
    });

    it('Escape closes about modal overlay', () => {
        init();
        fireContextMenu(100, 100);
        const aboutItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'About');
        aboutItem.click();
        expect(document.querySelector('.ee-modal-overlay')).not.toBeNull();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.querySelector('.ee-modal-overlay')).toBeNull();
    });

    it('menu position clamps to window bounds', () => {
        init();
        Object.defineProperty(window, 'innerWidth', { value: 200, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 150, configurable: true });
        fireContextMenu(500, 500);
        const menu = document.querySelector('.ee-cde-menu');
        expect(parseInt(menu.style.left)).toBeLessThanOrEqual(200 - 300);
        expect(parseInt(menu.style.top)).toBeLessThanOrEqual(150 - 200);
    });

    it('exit menu item shows toast', () => {
        init();
        fireContextMenu(100, 100);
        const exitItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Exit');
        exitItem.click();
        expect(showToast).toHaveBeenCalledWith('Nice try', 3000);
    });

    it('source menu item shows toast', () => {
        init();
        fireContextMenu(100, 100);
        const sourceItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Source');
        sourceItem.click();
        expect(showToast).toHaveBeenCalledWith('Check console', 3000);
    });

    it('print menu item calls window.print', () => {
        window.print = vi.fn();
        init();
        fireContextMenu(100, 100);
        const printItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Print');
        printItem.click();
        expect(window.print).toHaveBeenCalled();
    });

    it('contextmenu inside existing menu does not create a new one', () => {
        init();
        fireContextMenu(100, 100);
        const menu = document.querySelector('.ee-cde-menu');
        expect(menu).not.toBeNull();

        const menuItemCount = document.querySelectorAll('.ee-cde-menu__item').length;
        menu.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 110, clientY: 110 }));
        const newMenuItemCount = document.querySelectorAll('.ee-cde-menu__item').length;
        expect(newMenuItemCount).toBe(menuItemCount);
    });

    it('touchmove cancels long press when movement exceeds threshold', () => {
        init();

        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 }],
            bubbles: true,
        }));
        vi.advanceTimersByTime(200);

        target.dispatchEvent(new TouchEvent('touchmove', {
            touches: [{ clientX: 150, clientY: 100 }],
            bubbles: true,
        }));
        vi.advanceTimersByTime(400);

        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('touchend cancels pending long press', () => {
        init();

        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 }],
            bubbles: true,
        }));
        vi.advanceTimersByTime(200);

        target.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
        vi.advanceTimersByTime(400);

        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('returns destroy function that cleans up', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('destroy removes all event listeners', () => {
        const { destroy } = init();
        destroy();
        eeManager.discover.mockClear();

        fireContextMenu(100, 100);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('menu has separator elements between items', () => {
        init();
        fireContextMenu(100, 100);
        const seps = document.querySelectorAll('.ee-cde-menu__sep');
        expect(seps.length).toBe(2);
    });

    it('about modal body shows system info', () => {
        init();
        fireContextMenu(100, 100);
        const aboutItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'About');
        aboutItem.click();
        const body = document.querySelector('.ee-about-modal__body');
        expect(body.textContent).toContain('MILINSKY.OS v4.2.0');
        expect(body.textContent).toContain('PHP 8.4+');
        expect(body.textContent).toContain('OPERATIONAL');
    });

    it('theme toggle adds cyberpunk with toast', () => {
        html.removeAttribute('data-ee-theme');
        init();
        fireContextMenu(100, 100);
        const themeItem = Array.from(document.querySelectorAll('.ee-cde-menu__item'))
            .find((el) => el.textContent === 'Theme On');
        themeItem.click();
        expect(html.getAttribute('data-ee-theme')).toBe('cyberpunk');
        expect(showToast).toHaveBeenCalledWith('Cyberpunk on', 2000);
    });

    it('keydown with non-Escape key does not close menu', () => {
        init();
        fireContextMenu(100, 100);
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(document.querySelector('.ee-cde-menu')).not.toBeNull();
    });

    it('destroy prevents long press from creating menu', () => {
        const { destroy } = init();
        target.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 200 }],
            bubbles: true,
        }));
        destroy();
        vi.advanceTimersByTime(500);
        expect(document.querySelector('.ee-cde-menu')).toBeNull();
    });

    it('Self-destruct present when sessionSeed > 0.5', () => {
        eeManager.getSessionSeed.mockReturnValue(0.6);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const selfDestruct = items.find((el) => el.textContent === '> Self-destruct');
        expect(selfDestruct).toBeDefined();
    });

    it('Self-destruct absent when sessionSeed <= 0.5', () => {
        eeManager.getSessionSeed.mockReturnValue(0.5);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const selfDestruct = items.find((el) => el.textContent === '> Self-destruct');
        expect(selfDestruct).toBeUndefined();
    });

    it('Coffee break present when sessionSeed between 0.3 and 0.7', () => {
        eeManager.getSessionSeed.mockReturnValue(0.5);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const coffeeBreak = items.find((el) => el.textContent === '> Coffee break');
        expect(coffeeBreak).toBeDefined();
    });

    it('Coffee break absent when sessionSeed <= 0.3 or >= 0.7', () => {
        eeManager.getSessionSeed.mockReturnValue(0.2);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const coffeeBreak = items.find((el) => el.textContent === '> Coffee break');
        expect(coffeeBreak).toBeUndefined();
    });

    it('click Self-destruct sets body opacity to 0 and restores via timer', () => {
        eeManager.getSessionSeed.mockReturnValue(0.6);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const selfDestruct = items.find((el) => el.textContent === '> Self-destruct');
        selfDestruct.click();
        expect(document.body.style.opacity).toBe('0');
        vi.advanceTimersByTime(2000);
        expect(document.body.style.opacity).toBe('1');
    });

    it('click Coffee break calls showToast', () => {
        eeManager.getSessionSeed.mockReturnValue(0.5);
        init();
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const coffeeBreak = items.find((el) => el.textContent === '> Coffee break');
        coffeeBreak.click();
        expect(showToast).toHaveBeenCalledWith('(\\\n  \\)_  coffee\n   |_(\n', 5000);
    });

    it('Print Resume calls printResume when provided', () => {
        const mockPrintResume = vi.fn();
        createContextMenu({ eeManager, t, html, showToast, printResume: mockPrintResume });
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const printItem = items.find((el) => el.textContent === t('ee_menu_print'));
        printItem.click();
        expect(mockPrintResume).toHaveBeenCalledOnce();
    });

    it('Print Resume falls back to window.print when printResume not provided', () => {
        vi.spyOn(window, 'print').mockImplementation(() => {});
        createContextMenu({ eeManager, t, html, showToast });
        fireContextMenu(100, 100);
        const items = Array.from(document.querySelectorAll('.ee-cde-menu__item'));
        const printItem = items.find((el) => el.textContent === t('ee_menu_print'));
        printItem.click();
        expect(window.print).toHaveBeenCalled();
    });
});
