export function initContextMenu(eeManager, eeT, eeShowToast, html) {
    let activeMenu = null;
    function closeEeMenu() {
        if (activeMenu) {
            activeMenu.remove();
            activeMenu = null;
        }
    }
    function shuffleArray(arr, seed) {
        const result = arr.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(seed * (i + 1)) % result.length;
            const tmp = result[i];
            result[i] = result[j];
            result[j] = tmp;
        }
        return result;
    }
    function createMenu(x, y) {
        closeEeMenu();
        eeManager.discover('ee04');
        const menu = document.createElement('div');
        menu.className = 'ee-cde-menu';
        menu.style.left = `${Math.min(x, window.innerWidth - 300)}px`;
        menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;
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
            { label: eeT('ee_menu_about'), action: () => {
                closeEeMenu();
                const overlay = document.createElement('div');
                overlay.className = 'ee-modal-overlay';
                const modal = document.createElement('div');
                modal.className = 'ee-about-modal';
                const hdr = document.createElement('div');
                hdr.className = 'ee-about-modal__header';
                hdr.textContent = eeT('ee_modal_title');
                const body = document.createElement('div');
                body.className = 'ee-about-modal__body';
                body.innerHTML = `MILINSKY.OS v4.2.0<br>Build: 2026.05<br>Kernel: PHP 8.4+<br>Runtime: Duyler Framework<br>Uptime: ${eeManager.getVisitCount()} visits<br>Status: OPERATIONAL`;
                const closeBtn = document.createElement('button');
                closeBtn.className = 'ee-about-modal__close';
                closeBtn.textContent = eeT('ee_modal_ok');
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
            }},
            { label: eeT('ee_menu_source'), action: () => {
                closeEeMenu();
                eeShowToast(eeT('ee_toast_console'), 3000);
            }},
            { label: eeT('ee_menu_print'), action: () => {
                closeEeMenu();
                window.print();
            }},
            { label: html.getAttribute('data-ee-theme') === 'cyberpunk' ? eeT('ee_menu_theme_off') : eeT('ee_menu_theme_on'), action: () => {
                closeEeMenu();
                if (html.getAttribute('data-ee-theme') === 'cyberpunk') {
                    html.removeAttribute('data-ee-theme');
                    eeShowToast(eeT('ee_toast_cyber_off'), 2000);
                } else {
                    html.setAttribute('data-ee-theme', 'cyberpunk');
                    eeShowToast(eeT('ee_toast_cyber_on'), 2000);
                }
            }},
            { label: eeT('ee_menu_exit'), action: () => {
                closeEeMenu();
                eeShowToast(eeT('ee_toast_exit'), 3000);
            }}
        ];
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
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.ee-cde-menu') || e.target.closest('.ee-about-modal')) return;
        e.preventDefault();
        createMenu(e.clientX, e.clientY);
    });
    document.addEventListener('click', (e) => {
        if (activeMenu && !activeMenu.contains(e.target)) {
            closeEeMenu();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEeMenu();
            const overlay = document.querySelector('.ee-modal-overlay');
            if (overlay) overlay.remove();
        }
    });
    let longPressTimer = null;
    let longPressStart = null;
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        longPressStart = { x: touch.clientX, y: touch.clientY };
        longPressTimer = setTimeout(() => {
            createMenu(longPressStart.x, longPressStart.y);
            longPressStart = null;
        }, 500);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!longPressTimer) return;
        const touch = e.touches[0];
        const dx = touch.clientX - longPressStart.x;
        const dy = touch.clientY - longPressStart.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }, { passive: true });
    document.addEventListener('touchend', () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }, { passive: true });
}
