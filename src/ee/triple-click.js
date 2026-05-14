const TRIPLE_CLICK_THRESHOLD_MS = 500;
const UNREDACTED_DISPLAY_MS = 10000;
const REQUIRED_CLICKS = 3;

export function createTripleClick(ctx) {
    const { eeManager, t } = ctx;

    const timers = [];
    const listeners = [];
    let destroyed = false;
    let discovered = false;
    let activeSection = null;
    let originalContent = null;

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

            if (now - state.lastTime > TRIPLE_CLICK_THRESHOLD_MS) {
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

        originalContent = container.cloneNode(true);
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const unredactedEl = document.createElement('div');
        unredactedEl.className = 'ee-unredacted-content';
        unredactedEl.textContent = t('ee_unredacted_' + sectionName);
        container.appendChild(unredactedEl);

        schedule(() => {
            restoreContent(container, label, originalLabelText);
        }, UNREDACTED_DISPLAY_MS);
    }

    function restoreContent(container, label, originalLabelText) {
        if (!originalContent) return;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (const child of originalContent.childNodes) {
            container.appendChild(child.cloneNode(true));
        }

        label.textContent = originalLabelText;
        activeSection = null;
        originalContent = null;
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
