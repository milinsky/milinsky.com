import { shuffleArray } from './context-menu/shuffle.js';
import { buildMenuItems } from './context-menu/panel.js';

const MENU_MAX_WIDTH_PX = 300;
const MENU_MAX_HEIGHT_PX = 200;
const LONG_PRESS_MS = 500;
const TOUCH_MOVE_THRESHOLD_PX = 10;
const SEPARATOR_POSITIONS = [1, 3];

/**
 * Custom double-right-click context menu with themed items and about modal.
 * @param {{ eeManager: object, t: function, html?: HTMLElement, showToast?: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createContextMenu(ctx) {
    const { eeManager, t, html, showToast, printResume } = ctx;

    const timers = [];
    const listeners = [];
    let destroyed = false;
    let activeMenu = null;

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    function closeEeMenu() {
        if (activeMenu) {
            activeMenu.remove();
            activeMenu = null;
        }
    }

    function createMenu(x, y) {
        closeEeMenu();
        eeManager.discover('ee04');
        const menu = document.createElement('div');
        menu.className = 'ee-cde-menu';
        menu.style.left = `${Math.min(x, window.innerWidth - MENU_MAX_WIDTH_PX)}px`;
        menu.style.top = `${Math.min(y, window.innerHeight - MENU_MAX_HEIGHT_PX)}px`;
        const menuHeader = document.createElement('div');
        menuHeader.className = 'ee-cde-menu__header';
        menuHeader.textContent = 'MILINSKY.OS';
        menu.appendChild(menuHeader);
        const sep = () => {
            const s = document.createElement('div');
            s.className = 'ee-cde-menu__sep';
            menu.appendChild(s);
        };
        const sessionSeed = eeManager.getSessionSeed();
        const items = buildMenuItems({
            t,
            html,
            eeManager,
            showToast,
            printResume,
            closeMenu: closeEeMenu,
            schedule,
            sessionSeed,
        });
        const shuffled = shuffleArray(items, sessionSeed);
        for (const [ii, entry] of shuffled.entries()) {
            if (SEPARATOR_POSITIONS.includes(ii)) sep();
            const item = document.createElement('div');
            item.className = 'ee-cde-menu__item';
            item.textContent = entry.label;
            item.addEventListener('click', entry.action);
            menu.appendChild(item);
        }
        document.body.appendChild(menu);
        activeMenu = menu;
    }

    listen(document, 'contextmenu', (e) => {
        if (e.target.closest('.ee-cde-menu') || e.target.closest('.ee-about-modal')) return;
        e.preventDefault();
        createMenu(e.clientX, e.clientY);
    });

    listen(document, 'click', (e) => {
        if (activeMenu && !activeMenu.contains(e.target)) {
            closeEeMenu();
        }
    });

    listen(document, 'keydown', (e) => {
        if (e.key === 'Escape') {
            closeEeMenu();
            const overlay = document.querySelector('.ee-modal-overlay');
            if (overlay) overlay.remove();
        }
    });

    let longPressTimer = null;
    let longPressStart = null;

    listen(
        document,
        'touchstart',
        (e) => {
            const touch = e.touches[0];
            longPressStart = { x: touch.clientX, y: touch.clientY };
            const timerId = setTimeout(() => {
                if (destroyed) return;
                createMenu(longPressStart.x, longPressStart.y);
                longPressStart = null;
            }, LONG_PRESS_MS);
            timers.push(timerId);
            longPressTimer = timerId;
        },
        { passive: true }
    );

    listen(
        document,
        'touchmove',
        (e) => {
            if (!longPressTimer) return;
            const touch = e.touches[0];
            const dx = touch.clientX - longPressStart.x;
            const dy = touch.clientY - longPressStart.y;
            if (Math.abs(dx) > TOUCH_MOVE_THRESHOLD_PX || Math.abs(dy) > TOUCH_MOVE_THRESHOLD_PX) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        },
        { passive: true }
    );

    listen(
        document,
        'touchend',
        () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        },
        { passive: true }
    );

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler, options } of listeners) {
                target.removeEventListener(event, handler, options);
            }
        },
    };
}
