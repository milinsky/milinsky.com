const SHAKE_THRESHOLD = 15;
const STATIC_DURATION_MS = 2000;
const OVERLAY_REMOVE_MS = 4000;

const ART_POOL = [
    '  ___\n /   \\\n| O O |\n|  ^  |\n \\_-_/\n\n  SHAKEN, NOT STIRRED.',
    '  _______\n |       |\n | R E S |\n | E T R |\n |___O___|\n\n  CONNECTION LOST.',
    '  [!!!]\n  SENSOR\n  OVERLOAD\n\n  SYSTEM REBOOTING...',
];

/**
 * Shake mobile easter egg — detects device shake via DeviceMotionEvent
 * and triggers CRT breakdown with ASCII art overlay.
 * @param {{ eeManager: object, t: function, showToast: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createShake(ctx) {
    const { eeManager, t, showToast, reducedMotion } = ctx;
    let destroyed = false;
    let discovered = false;
    const timers = [];
    const listeners = [];

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

    function selectAsciiArt(seed) {
        const index = Math.floor(seed * ART_POOL.length) % ART_POOL.length;
        return ART_POOL[index];
    }

    function buildOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'ee-shake-overlay';
        const pre = document.createElement('pre');
        pre.className = 'ee-shake-overlay__art';
        pre.textContent = selectAsciiArt(eeManager.getSessionSeed());
        overlay.appendChild(pre);
        overlay.addEventListener('click', () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        });
        return overlay;
    }

    function triggerShakeAnimation() {
        document.body.classList.add('ee-shake-active');
        schedule(() => {
            document.body.classList.remove('ee-shake-active');
        }, STATIC_DURATION_MS);
        showToast(t('ee_shake_detected'));
        schedule(() => {
            const overlay = buildOverlay();
            document.body.appendChild(overlay);
            schedule(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, OVERLAY_REMOVE_MS);
        }, STATIC_DURATION_MS);
    }

    function onDeviceMotion(event) {
        if (destroyed || discovered) return;
        const { accelerationIncludingGravity } = event;
        if (!accelerationIncludingGravity) return;
        const { x, y, z } = accelerationIncludingGravity;
        if (x === null || y === null || z === null) return;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        if (magnitude > SHAKE_THRESHOLD) {
            discovered = true;
            eeManager.discover('ee21');
            if (reducedMotion) {
                showToast(t('ee_shake_detected'));
                return;
            }
            triggerShakeAnimation();
        }
    }

    function onFirstGesture() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then((state) => {
                    if (state === 'granted') {
                        listen(window, 'devicemotion', onDeviceMotion);
                    }
                })
                .catch(() => {});
        }
        window.removeEventListener('click', onFirstGesture);
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        listen(window, 'click', onFirstGesture);
    } else {
        listen(window, 'devicemotion', onDeviceMotion);
    }

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
