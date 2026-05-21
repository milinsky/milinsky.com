import { attachBadge, updateBadgeCount, updateBadgeLanguage } from './achievements/badge.js';
import { attachModal } from './achievements/modal.js';
import { attachPanel } from './achievements/panel.js';

const TOTAL_EE_COUNT = 18;
const HUNTER_THRESHOLD = 5;

const EE_IDS = [
    'ee01',
    'ee02',
    'ee03',
    'ee04',
    'ee06',
    'ee08',
    'ee09',
    'ee10',
    'ee11',
    'ee12',
    'ee13',
    'ee14',
    'ee15',
    'ee16',
    'ee19',
    'ee21',
    'ee22',
    'ee-solarized',
];

export { TOTAL_EE_COUNT, EE_IDS };

/**
 * Achievement system that tracks discovered easter eggs.
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createAchievements(ctx) {
    const { eeManager, t } = ctx;
    const listeners = [];
    let destroyed = false;
    let hunterShown = false;
    let perfectionistShown = false;
    let panelEl = null;
    let modalEl = null;
    let badgeEl = null;

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    function countDiscovered() {
        let count = 0;
        for (const id of EE_IDS) {
            if (eeManager.isDiscovered(id)) count++;
        }
        return count;
    }

    function hidePanel() {
        if (panelEl) {
            panelEl.remove();
            panelEl = null;
        }
    }

    function onDiscover() {
        if (destroyed) return;
        const count = countDiscovered();
        if (count >= HUNTER_THRESHOLD && !hunterShown) {
            hunterShown = true;
            badgeEl = attachBadge(t, listen, countDiscovered, TOTAL_EE_COUNT);
        }
        updateBadgeCount(badgeEl, countDiscovered, TOTAL_EE_COUNT);
        if (count >= TOTAL_EE_COUNT && !perfectionistShown) {
            perfectionistShown = true;
            modalEl = attachModal(t, listen, () => {
                modalEl = null;
            });
        }
    }

    function onHashChange() {
        if (destroyed) return;
        if (window.location.hash === '#achievements') {
            if (!panelEl) {
                panelEl = attachPanel(eeManager, t, listen, countDiscovered, TOTAL_EE_COUNT, EE_IDS, () => {
                    window.location.hash = '';
                    hidePanel();
                });
            }
        } else {
            hidePanel();
        }
    }

    eeManager.discover('ee08');
    const originalDiscover = eeManager.discover;
    eeManager.discover = function wrappedDiscover(id) {
        const wasNew = !eeManager.isDiscovered(id);
        originalDiscover.call(eeManager, id);
        if (wasNew) onDiscover();
    };

    listen(window, 'hashchange', onHashChange);
    onDiscover();
    if (window.location.hash === '#achievements') onHashChange();

    return {
        destroy() {
            destroyed = true;
            eeManager.discover = originalDiscover;
            if (panelEl) {
                panelEl.remove();
                panelEl = null;
            }
            if (modalEl) {
                modalEl.remove();
                modalEl = null;
            }
            if (badgeEl) {
                badgeEl.remove();
                badgeEl = null;
            }
            for (const l of listeners) l.target.removeEventListener(l.event, l.handler);
        },
        updateLanguage() {
            updateBadgeLanguage(badgeEl, t);
        },
    };
}
