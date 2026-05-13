/**
 * Simple reactive state store.
 * @module state
 */

const state = {
    lang: localStorage.getItem('lang') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

const listeners = new Map();

/**
 * Get a state value by key.
 * @param {string} key
 * @returns {*}
 */
export function getState(key) {
    return state[key];
}

/**
 * Set a state value and notify subscribers.
 * @param {string} key
 * @param {*} value
 */
export function setState(key, value) {
    state[key] = value;
    const cbs = listeners.get(key);
    if (cbs) {
        for (const fn of cbs) {
            fn(value);
        }
    }
}

/**
 * Subscribe to state changes.
 * @param {string} key
 * @param {function(*): void} callback
 * @returns {function(): void} Unsubscribe function
 */
export function subscribe(key, callback) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);
    return () => {
        listeners.get(key).delete(callback);
    };
}
