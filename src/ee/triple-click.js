const DOUBLE_CLICK_THRESHOLD_MS = 500;
const UNREDACTED_DISPLAY_MS = 12000;
const REQUIRED_CLICKS = 2;

export function createTripleClick(ctx) {
    const { eeManager, t } = ctx;

    const timers = [];
    const listeners = [];
    let destroyed = false;
    let discovered = false;
    let activeSection = null;
    function schedule(fn, delay) {
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

    const labels = document.querySelectorAll('.section__label[data-section]');
    if (labels.length === 0) return { destroy() {} };

    const clickStates = new Map();

    for (const label of labels) {
        const sectionName = label.getAttribute('data-section');
        clickStates.set(label, { count: 0, lastTime: 0 });

        listen(label, 'click', () => {
            if (destroyed) return;
            if (activeSection !== null) return;

            const now = Date.now();
            const state = clickStates.get(label);

            if (now - state.lastTime > DOUBLE_CLICK_THRESHOLD_MS) {
                state.count = 1;
            } else {
                state.count += 1;
            }
            state.lastTime = now;

            if (state.count >= REQUIRED_CLICKS) {
                state.count = 0;
                activateUnredacted(label, sectionName);
            }
        });
    }

    function activateUnredacted(label, sectionName) {
        const section = label.closest('section');
        if (!section) return;

        const container = section.querySelector('.container');
        if (!container) return;

        activeSection = sectionName;
        if (!discovered) {
            discovered = true;
            eeManager.discover('ee19');
        }

        const originalLabelText = label.textContent;
        label.textContent = t('ee_unredacted_label_' + sectionName);

        container.classList.add('ee-unredacted-active');

        const overlay = document.createElement('div');
        overlay.className = 'ee-unredacted-content';
        overlay.textContent = t('ee_unredacted_' + sectionName);
        container.appendChild(overlay);

        schedule(() => {
            restoreContent(container, label, originalLabelText, overlay);
        }, UNREDACTED_DISPLAY_MS);
    }

    function restoreContent(container, label, originalLabelText, overlay) {
        container.classList.remove('ee-unredacted-active');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        label.textContent = originalLabelText;
        activeSection = null;
    }

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
        },
    };
}
