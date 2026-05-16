const TOAST_DURATION_MS = 3000;
const TOAST_SHORT_DURATION_MS = 2000;
const SELF_DESTRUCT_RESTORE_MS = 2000;
const COFFEE_TOAST_MS = 5000;
const SEED_SELF_DESTRUCT_THRESHOLD = 0.5;
const SEED_COFFEE_MIN = 0.3;
const SEED_COFFEE_MAX = 0.7;

export function buildAboutPanel(t, eeManager) {
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
    return overlay;
}

export function buildMenuItems({ t, html, eeManager, showToast, printResume, closeMenu, schedule, sessionSeed }) {
    const items = [
        {
            label: t('ee_menu_about'),
            action: () => {
                closeMenu();
                buildAboutPanel(t, eeManager);
            },
        },
        {
            label: t('ee_menu_source'),
            action: () => {
                closeMenu();
                showToast(t('ee_toast_console'), TOAST_DURATION_MS);
            },
        },
        {
            label: t('ee_menu_print'),
            action: () => {
                closeMenu();
                if (printResume) {
                    printResume();
                } else {
                    window.print();
                }
            },
        },
        {
            label: html?.getAttribute('data-ee-theme') === 'cyberpunk' ? t('ee_menu_theme_off') : t('ee_menu_theme_on'),
            action: () => {
                closeMenu();
                if (html?.getAttribute('data-ee-theme') === 'cyberpunk') {
                    html.removeAttribute('data-ee-theme');
                    showToast(t('ee_toast_cyber_off'), TOAST_SHORT_DURATION_MS);
                } else {
                    html?.setAttribute('data-ee-theme', 'cyberpunk');
                    showToast(t('ee_toast_cyber_on'), TOAST_SHORT_DURATION_MS);
                }
            },
        },
        {
            label: t('ee_menu_exit'),
            action: () => {
                closeMenu();
                showToast(t('ee_toast_exit'), TOAST_DURATION_MS);
            },
        },
    ];

    if (sessionSeed > SEED_SELF_DESTRUCT_THRESHOLD) {
        items.push({
            label: '> Self-destruct',
            action: () => {
                closeMenu();
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
                closeMenu();
                showToast('(\\\n  \\)_  coffee\n   |_(\n', COFFEE_TOAST_MS);
            },
        });
    }

    return items;
}
