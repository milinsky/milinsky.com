const MIN_VISITS = 2;
const VISIT_MILESTONE_5 = 5;
const VISIT_MILESTONE_10 = 10;
const VISIT_MILESTONE_20 = 20;
const TYPE_DELAY_BASE_MS = 30;
const TYPE_DELAY_RANDOM_MS = 20;

/**
 * Shows a returning-visitor message typed out in the terminal frame.
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createVisitCounter(ctx) {
    const { eeManager, t } = ctx;

    const timers = [];
    let destroyed = false;

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    const visitCount = eeManager.getVisitCount();
    if (visitCount < MIN_VISITS) return { destroy() {} };

    const terminalFrame = document.querySelector('.hero__terminal-frame');
    if (!terminalFrame) return { destroy() {} };

    let msg = '';
    if (visitCount >= VISIT_MILESTONE_20) {
        msg = t('ee_visit_20').replace('#N', String(visitCount));
    } else if (visitCount >= VISIT_MILESTONE_10) {
        msg = t('ee_visit_10');
    } else if (visitCount >= VISIT_MILESTONE_5) {
        msg = t('ee_visit_5').replace('#N', String(visitCount));
    } else {
        msg = t('ee_visit_2').replace('#N', String(visitCount));
    }

    const msgEl = document.createElement('div');
    msgEl.className = 'ee-visit-msg';
    terminalFrame.appendChild(msgEl);

    let idx = 0;

    function typeVisit() {
        if (idx < msg.length) {
            msgEl.textContent += msg[idx];
            idx++;
            schedule(typeVisit, TYPE_DELAY_BASE_MS + Math.random() * TYPE_DELAY_RANDOM_MS);
        }
    }

    typeVisit();

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        },
    };
}
