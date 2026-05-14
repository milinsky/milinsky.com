const MENU_MAX_WIDTH_PX = 300;
const MENU_MAX_HEIGHT_PX = 200;
const LONG_PRESS_MS = 500;
const TOUCH_MOVE_THRESHOLD_PX = 10;
const SEED_SELF_DESTRUCT_THRESHOLD = 0.5;
const SEED_COFFEE_MIN = 0.3;
const SEED_COFFEE_MAX = 0.7;
const SELF_DESTRUCT_RESTORE_MS = 2000;
const COFFEE_TOAST_MS = 5000;

function seededRandom(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

function shuffleArray(arr, seed) {
    const result = arr.slice();
    let s = seed * 10000;
    for (let i = result.length - 1; i > 0; i--) {
        s = seededRandom(s);
        const j = Math.floor(s * (i + 1));
        const tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
    }
    return result;
}

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

    let activeMenu = null;

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

        const items = [
            {
                label: t('ee_menu_about'),
                action: () => {
                    closeEeMenu();
                    const overlay = document.createElement('div');
                    overlay.className = 'ee-modal-overlay';
                    const modal = document.createElement('div');
                    modal.className = 'ee-about-modal';
                    const hdr = document.createElement('div');
                    hdr.className = 'ee-about-modal__header';
                    hdr.textContent = t('ee_modal_title');
                    const body = document.createElement('div');
                    body.className = 'ee-about-modal__body';
                    const lines = [
                        'MILINSKY.OS v4.2.0',
                        'Build: 2026.05',
                        'Kernel: PHP 8.4+',
                        'Runtime: Duyler Framework',
                        `Uptime: ${eeManager.getVisitCount()} visits`,
                        'Status: OPERATIONAL',
                    ];
                    for (const line of lines) {
                        const p = document.createElement('div');
                        p.textContent = line;
                        body.appendChild(p);
                    }
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'ee-about-modal__close';
                    closeBtn.textContent = t('ee_modal_ok');
                    closeBtn.type = 'button';
                    closeBtn.addEventListener('click', () => {
                        overlay.remove();
                    });
                    modal.appendChild(hdr);
                    modal.appendChild(body);
                    modal.appendChild(closeBtn);
                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);
                    overlay.addEventListener('click', (ev) => {
                        if (ev.target === overlay) {
                            overlay.remove();
                        }
                    });
                },
            },
            {
                label: t('ee_menu_source'),
                action: () => {
                    closeEeMenu();
                    showToast(t('ee_toast_console'), 3000);
                },
            },
            {
                label: t('ee_menu_print'),
                action: () => {
                    closeEeMenu();
                    if (printResume) {
                        printResume();
                    } else {
                        window.print();
                    }
                },
            },
            {
                label:
                    html?.getAttribute('data-ee-theme') === 'cyberpunk'
                        ? t('ee_menu_theme_off')
                        : t('ee_menu_theme_on'),
                action: () => {
                    closeEeMenu();
                    if (html?.getAttribute('data-ee-theme') === 'cyberpunk') {
                        html.removeAttribute('data-ee-theme');
                        showToast(t('ee_toast_cyber_off'), 2000);
                    } else {
                        html?.setAttribute('data-ee-theme', 'cyberpunk');
                        showToast(t('ee_toast_cyber_on'), 2000);
                    }
                },
            },
            {
                label: t('ee_menu_exit'),
                action: () => {
                    closeEeMenu();
                    showToast(t('ee_toast_exit'), 3000);
                },
            },
        ];

        const sessionSeed = eeManager.getSessionSeed();

        if (sessionSeed > SEED_SELF_DESTRUCT_THRESHOLD) {
            items.push({
                label: '> Self-destruct',
                action: () => {
                    closeEeMenu();
                    document.body.style.opacity = '0';
                    schedule(() => {
                        document.body.style.opacity = '1';
                    }, SELF_DESTRUCT_RESTORE_MS);
                },
            });
        }

        if (sessionSeed > SEED_COFFEE_MIN && sessionSeed < SEED_COFFEE_MAX) {
            items.push({
                label: '> Coffee break',
                action: () => {
                    closeEeMenu();
                    showToast('(\\\n  \\)_  coffee\n   |_(\n', COFFEE_TOAST_MS);
                },
            });
        }

        const shuffled = shuffleArray(items, eeManager.getSessionSeed());
        for (let ii = 0; ii < shuffled.length; ii++) {
            if (ii === 1 || ii === 3) sep();
            const item = document.createElement('div');
            item.className = 'ee-cde-menu__item';
            item.textContent = shuffled[ii].label;
            item.addEventListener('click', shuffled[ii].action);
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
