/** @module utils/toast */

const APPEAR_DELAY_MS = 10;
const DEFAULT_DURATION_MS = 3000;
const FADE_OUT_MS = 300;

/**
 * Show a toast notification.
 * @param {string} message
 * @param {number} [duration=DEFAULT_DURATION_MS]
 */
export function showToast(message, duration) {
    const toast = document.createElement('div');
    toast.className = 'ee-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('ee-toast--visible');
    }, APPEAR_DELAY_MS);
    setTimeout(() => {
        toast.classList.remove('ee-toast--visible');
        setTimeout(() => {
            toast.remove();
        }, FADE_OUT_MS);
    }, duration || DEFAULT_DURATION_MS);
}
