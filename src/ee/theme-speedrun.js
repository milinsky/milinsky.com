import { subscribe } from '../state.js';

const TOGGLE_THRESHOLD = 5;
const SPEED_WINDOW_MS = 3000;
const GEOCITIES_DURATION_MS = 30000;
const TOAST_DURATION_MS = 8000;

/**
 * Theme speedrun easter egg — 5 theme toggles within 3 seconds
 * activates a temporary GeoCities-style transformation.
 * @param {{ eeManager: object, t: function, showToast: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createThemeSpeedrun(ctx) {
    const { eeManager, t, showToast, reducedMotion } = ctx;

    let destroyed = false;
    let discovered = false;
    const timestamps = [];

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        return id;
    }

    function triggerGeoCities() {
        document.documentElement.classList.add('ee-geocities');
        schedule(restoreNormal, GEOCITIES_DURATION_MS);
    }

    function restoreNormal() {
        document.documentElement.classList.remove('ee-geocities');
        showToast(t('ee_speedrun_recovered'), TOAST_DURATION_MS);
    }

    function activate() {
        if (!discovered) {
            eeManager.discover('ee10');
            discovered = true;
        }
        if (!reducedMotion) {
            triggerGeoCities();
        } else {
            restoreNormal();
        }
    }

    function onThemeChange() {
        if (destroyed) return;
        const now = Date.now();
        timestamps.push(now);

        while (timestamps.length > 0 && now - timestamps[0] > SPEED_WINDOW_MS) {
            timestamps.shift();
        }

        if (timestamps.length >= TOGGLE_THRESHOLD) {
            timestamps.length = 0;
            activate();
        }
    }

    const unsubTheme = subscribe('theme', onThemeChange);

    return {
        destroy() {
            destroyed = true;
            unsubTheme();
        },
    };
}
