const OVERSCROLL_NEEDED = 3;
const CRACK_DURATION_MS = 600;
const OVERSCROLL_THRESHOLD_PX = 30;
const GESTURE_GAP_MS = 1500;
const GESTURE_RESET_MS = 5000;

function isAtBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - OVERSCROLL_THRESHOLD_PX;
}

/**
 * Overscroll secret easter egg — 3 overscroll attempts at page bottom reveal a hidden classified section.
 * @param {{ eeManager: object, t: function, showToast: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createOverscrollSecret(ctx) {
    const { eeManager, t, showToast, reducedMotion } = ctx;

    let destroyed = false;
    let discovered = false;
    let overscrollCount = 0;
    let lastOverscrollTime = 0;
    let gestureTimer = null;
    const timers = [];
    const listeners = [];
    let sectorEl = null;

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

    function createSector() {
        const el = document.createElement('div');
        el.className = 'ee-secret-sector';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'ee-secret-sector__close';
        closeBtn.textContent = '×';
        closeBtn.title = t('ee_overscroll_close');
        listen(closeBtn, 'click', dismiss);

        const label = document.createElement('div');
        label.className = 'ee-secret-sector__label';
        label.textContent = t('ee_overscroll_label');

        const title = document.createElement('div');
        title.className = 'ee-secret-sector__title';
        title.textContent = t('ee_overscroll_title');

        const content = document.createElement('div');
        content.className = 'ee-secret-sector__content';
        content.textContent = t('ee_overscroll_content');

        el.appendChild(closeBtn);
        el.appendChild(label);
        el.appendChild(title);
        el.appendChild(content);
        return el;
    }

    function activate() {
        if (discovered) return;
        discovered = true;
        eeManager.discover('ee22');

        sectorEl = createSector();
        document.body.appendChild(sectorEl);

        if (reducedMotion) {
            sectorEl.classList.add('ee-secret-sector--visible');
            showToast(t('ee_overscroll_discovered'));
            return;
        }

        document.body.classList.add('ee-secret-crack');
        schedule(() => {
            document.body.classList.remove('ee-secret-crack');
            if (sectorEl) {
                sectorEl.classList.add('ee-secret-sector--visible');
            }
            showToast(t('ee_overscroll_discovered'));
        }, CRACK_DURATION_MS);
    }

    function dismiss() {
        if (sectorEl && sectorEl.parentNode) {
            sectorEl.parentNode.removeChild(sectorEl);
            sectorEl = null;
        }
        discovered = false;
        overscrollCount = 0;
        lastOverscrollTime = 0;
        document.body.classList.remove('ee-secret-crack');
    }

    function handleOverscrollEvent() {
        if (destroyed || discovered) return;
        if (!isAtBottom()) return;

        const now = Date.now();

        if (gestureTimer) clearTimeout(gestureTimer);
        gestureTimer = setTimeout(() => {
            overscrollCount = 0;
        }, GESTURE_RESET_MS);

        const gap = now - lastOverscrollTime;
        if (gap < GESTURE_GAP_MS) return;

        lastOverscrollTime = now;
        overscrollCount++;

        if (overscrollCount >= OVERSCROLL_NEEDED) {
            activate();
        }
    }

    function onWheel(event) {
        if (event.deltaY <= 0) return;
        handleOverscrollEvent();
    }

    function onTouchMove(event) {
        const touch = event.touches[0];
        if (!touch) return;
        handleOverscrollEvent();
    }

    listen(window, 'wheel', onWheel);
    listen(window, 'touchmove', onTouchMove);

    return {
        destroy() {
            destroyed = true;
            if (gestureTimer) clearTimeout(gestureTimer);
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler, options } of listeners) {
                target.removeEventListener(event, handler, options);
            }
            if (sectorEl && sectorEl.parentNode) {
                sectorEl.parentNode.removeChild(sectorEl);
            }
            document.body.classList.remove('ee-secret-crack');
        },
    };
}
