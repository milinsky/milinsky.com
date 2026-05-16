const SELECT_CHECK_DELAY_MS = 100;
const SELECT_CHECK_MOUSE_DELAY_MS = 200;

/**
 * Discovers a hidden easter egg when the user selects secret text on the page.
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createSelectSecret(ctx) {
    const { eeManager, t } = ctx;

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

    const secretTexts = document.querySelectorAll('.ee-secret-text');
    if (secretTexts.length === 0) return { destroy() {} };

    function revealSecretText(element) {
        const key = element.getAttribute('data-ee-key');
        if (key) {
            element.textContent = t(key);
        }
    }

    for (const el of secretTexts) {
        revealSecretText(el);
    }

    let discovered = false;

    function checkSelection() {
        if (discovered) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        for (const el of secretTexts) {
            if (sel.containsNode(el, true)) {
                discovered = true;
                eeManager.discover('ee11');
                return;
            }
        }
    }

    listen(document, 'keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            schedule(checkSelection, SELECT_CHECK_DELAY_MS);
        }
    });

    listen(document, 'mouseup', () => {
        schedule(checkSelection, SELECT_CHECK_MOUSE_DELAY_MS);
    });

    listen(document, 'touchend', () => {
        schedule(checkSelection, SELECT_CHECK_MOUSE_DELAY_MS);
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
