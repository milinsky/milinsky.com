import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createShake } from '../../src/ee/shake.js';

function createMotionEvent(x, y, z) {
    const event = new Event('devicemotion');
    event.accelerationIncludingGravity = { x, y, z };
    return event;
}

describe('shake', () => {
    let eeManager;
    let t;
    let showToast;
    let instance;
    let originalRequestPermission;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        document.body.classList.remove('ee-shake-active');
        originalRequestPermission = globalThis.DeviceMotionEvent.requestPermission;
        delete globalThis.DeviceMotionEvent.requestPermission;
        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn(() => 0.1),
        };
        t = vi.fn((key) => key);
        showToast = vi.fn();
    });

    afterEach(() => {
        if (instance) {
            instance.destroy();
            instance = null;
        }
        document.body.classList.remove('ee-shake-active');
        globalThis.DeviceMotionEvent.requestPermission = originalRequestPermission;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function init(opts = {}) {
        instance = createShake({
            eeManager,
            t,
            showToast,
            reducedMotion: opts.reducedMotion ?? false,
        });
        return instance;
    }

    it('returns destroy function', () => {
        init();
        expect(instance.destroy).toBeTypeOf('function');
        expect(() => instance.destroy()).not.toThrow();
    });

    it('detects shake when acceleration exceeds threshold', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).toHaveBeenCalledWith('ee21');
    });

    it('does not trigger below threshold', () => {
        init();
        window.dispatchEvent(createMotionEvent(1, 2, 3));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('calls discover exactly once on shake', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('adds shake-active class to body on shake', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(document.body.classList.contains('ee-shake-active')).toBe(true);
    });

    it('removes shake-active class after static duration', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(document.body.classList.contains('ee-shake-active')).toBe(true);
        vi.advanceTimersByTime(2000);
        expect(document.body.classList.contains('ee-shake-active')).toBe(false);
    });

    it('shows overlay with ASCII art after static duration', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(document.querySelector('.ee-shake-overlay')).toBeNull();
        vi.advanceTimersByTime(2000);
        expect(document.querySelector('.ee-shake-overlay')).not.toBeNull();
        expect(document.querySelector('.ee-shake-overlay__art')).not.toBeNull();
    });

    it('removes overlay after timeout', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        vi.advanceTimersByTime(2000);
        expect(document.querySelector('.ee-shake-overlay')).not.toBeNull();
        vi.advanceTimersByTime(4000);
        expect(document.querySelector('.ee-shake-overlay')).toBeNull();
    });

    it('click on overlay removes it', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        vi.advanceTimersByTime(2000);
        const overlay = document.querySelector('.ee-shake-overlay');
        expect(overlay).not.toBeNull();
        overlay.click();
        expect(document.querySelector('.ee-shake-overlay')).toBeNull();
    });

    it('shows toast with translated message on shake', () => {
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(showToast).toHaveBeenCalledWith('ee_shake_detected');
        expect(t).toHaveBeenCalledWith('ee_shake_detected');
    });

    it('skips animation but shows toast when reducedMotion', () => {
        init({ reducedMotion: true });
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(document.body.classList.contains('ee-shake-active')).toBe(false);
        expect(eeManager.discover).toHaveBeenCalledWith('ee21');
        expect(showToast).toHaveBeenCalledWith('ee_shake_detected');
        vi.advanceTimersByTime(2000);
        expect(document.querySelector('.ee-shake-overlay')).toBeNull();
    });

    it('does not react to motion after destroy', () => {
        init();
        instance.destroy();
        instance = null;
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles null acceleration values gracefully', () => {
        init();
        const event = new Event('devicemotion');
        event.accelerationIncludingGravity = { x: null, y: null, z: null };
        window.dispatchEvent(event);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles missing accelerationIncludingGravity', () => {
        init();
        const event = new Event('devicemotion');
        window.dispatchEvent(event);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('selects art based on session seed', () => {
        eeManager.getSessionSeed = vi.fn(() => 0.99);
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        vi.advanceTimersByTime(2000);
        const art = document.querySelector('.ee-shake-overlay__art');
        expect(art).not.toBeNull();
        expect(art.textContent.length).toBeGreaterThan(0);
    });

    it('sets up iOS permission click handler when requestPermission exists', async () => {
        globalThis.DeviceMotionEvent.requestPermission = vi.fn(() => Promise.resolve('granted'));
        init();
        window.dispatchEvent(new Event('click'));
        await vi.advanceTimersByTimeAsync(0);
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).toHaveBeenCalledWith('ee21');
    });

    it('does not listen to devicemotion directly when iOS requestPermission exists', () => {
        globalThis.DeviceMotionEvent.requestPermission = vi.fn(() => Promise.resolve('denied'));
        init();
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('iOS click with denied permission does not add devicemotion listener', async () => {
        globalThis.DeviceMotionEvent.requestPermission = vi.fn(() => Promise.resolve('denied'));
        init();
        window.dispatchEvent(new Event('click'));
        await vi.advanceTimersByTimeAsync(0);
        window.dispatchEvent(createMotionEvent(10, 10, 10));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('iOS click with rejected promise handles error gracefully', async () => {
        globalThis.DeviceMotionEvent.requestPermission = vi.fn(() => Promise.reject(new Error('blocked')));
        init();
        await expect(async () => {
            window.dispatchEvent(new Event('click'));
            await vi.advanceTimersByTimeAsync(0);
        }).not.toThrow();
        expect(eeManager.discover).not.toHaveBeenCalled();
    });
});
