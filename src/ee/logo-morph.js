const MAX_CLICKS = 7;
const CLICK_GAP_MS = 500;
const MATRIX_CELL_SIZE_PX = 20;
const MATRIX_CHAR_MIN = 10;
const MATRIX_CHAR_RANGE = 20;
const MATRIX_MIN_DURATION_S = 1;
const MATRIX_DURATION_RANGE_S = 2;
const MATRIX_MAX_DELAY_S = 0.8;
const MORPH_DISPLAY_MS = 3000;
const MATRIX_OVERLAY_MS = 2000;

/**
 * Triggers a matrix-rain morph of the ASCII logo after rapid clicks.
 * @param {{ eeManager: object, t: function, showToast?: function, reducedMotion?: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createLogoMorph(ctx) {
    const { eeManager, t, showToast, reducedMotion } = ctx;

    const timers = [];
    const listeners = [];
    let destroyed = false;

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    const logoPre = document.querySelector('.nav__logo-ascii');
    const logoLink = document.querySelector('.nav__logo');
    const originalLogo = logoPre?.textContent || '';
    if (!logoLink || !logoPre) return { destroy() {} };

    const altArts = [
        '    /\\\n   /  \\\n  | ** |\n  | -> |\n /| ~~ |\\\n/_|____|_\\\n  |    |',
        ' /\\_/\\\n( o.o )\n > ^ <\n/|   |\\\n(_|   |_)',
        '     /\\\n    /  \\\n   | ** |\n   | PHP|\n   | ** |\n  /| .. |\\\n / +----+ \\',
        '  ____  _\n |  _ \\(_)\n | | | |_  __ _\n | |_| | |/ _` |\n |  __/| | (_| |\n |_|   |_|\\__, |\n           __/ |\n          |___/',
        '  _________\n |  ______ |\n | |      ||\n | |>>>>>>||\n | |______||\n |_________|\n   |_____|\n   |_____|',
    ];

    let clicks = [];
    let morphActive = false;

    listen(logoLink, 'click', (e) => {
        if (morphActive) return;
        e.preventDefault();
        clicks.push(Date.now());
        if (clicks.length > MAX_CLICKS) {
            clicks.shift();
        }
        if (clicks.length === MAX_CLICKS) {
            if (clicks.every((t, i) => i === 0 || t - clicks[i - 1] < CLICK_GAP_MS)) {
                clicks = [];
                morphActive = true;
                eeManager.discover('ee03');
                if (reducedMotion) {
                    showToast(t('ee_logo_reduced'), MORPH_DISPLAY_MS);
                    const artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                    logoPre.textContent = altArts[artIdx];
                    schedule(() => {
                        logoPre.textContent = originalLogo;
                        morphActive = false;
                    }, MORPH_DISPLAY_MS);
                    return;
                }
                const overlay = document.createElement('div');
                overlay.className = 'ee-matrix-overlay';
                document.body.appendChild(overlay);
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
                const colCount = Math.floor(window.innerWidth / MATRIX_CELL_SIZE_PX);
                for (let col = 0; col < colCount; col++) {
                    const colEl = document.createElement('div');
                    colEl.className = 'ee-matrix-col';
                    colEl.style.left = `${col * MATRIX_CELL_SIZE_PX}px`;
                    let text = '';
                    const len = MATRIX_CHAR_MIN + Math.floor(Math.random() * MATRIX_CHAR_RANGE);
                    for (let ci = 0; ci < len; ci++) {
                        text += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    colEl.textContent = text;
                    colEl.style.animationDuration = `${MATRIX_MIN_DURATION_S + Math.random() * MATRIX_DURATION_RANGE_S}s`;
                    colEl.style.animationDelay = `${Math.random() * MATRIX_MAX_DELAY_S}s`;
                    overlay.appendChild(colEl);
                }
                schedule(() => {
                    overlay.remove();
                    const artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                    logoPre.textContent = altArts[artIdx];
                    schedule(() => {
                        logoPre.textContent = originalLogo;
                        morphActive = false;
                    }, MORPH_DISPLAY_MS);
                }, MATRIX_OVERLAY_MS);
            }
        }
    });

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
