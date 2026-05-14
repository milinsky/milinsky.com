import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPhosphorTrail } from '../../src/ee/phosphor-trail.js';

describe('phosphor-trail', () => {
    let eeManager;
    let t;
    let showToast;
    let destroyFn;
    let canvasCtx;

    beforeEach(() => {
        document.body.innerHTML = '';
        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn().mockReturnValue(0.3),
        };
        t = vi.fn((key) => key);
        showToast = vi.fn();
        destroyFn = null;

        const canvas = document.createElement('canvas');
        canvasCtx = canvas.getContext('2d');
        canvasCtx.stroke.mockClear();
        canvasCtx.fillRect.mockClear();
        canvasCtx.beginPath.mockClear();
        canvasCtx.moveTo.mockClear();
        canvasCtx.lineTo.mockClear();
        canvasCtx.save.mockClear();
        canvasCtx.restore.mockClear();
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        vi.restoreAllMocks();
    });

    function init(overrides = {}) {
        const ctx = { eeManager, t, showToast, reducedMotion: false, ...overrides };
        const result = createPhosphorTrail(ctx);
        destroyFn = result.destroy;
        return result;
    }

    function moveMouse(x, y) {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
    }

    function moveMouseBy(distance) {
        const step = 10;
        const steps = Math.ceil(distance / step);
        for (let i = 0; i <= steps; i++) {
            moveMouse(i * step, 0);
        }
    }

    function getCanvas() {
        return document.querySelector('.ee-phosphor-canvas');
    }

    function getCtx() {
        const canvas = getCanvas();
        return canvas ? canvas.getContext('2d') : null;
    }

    it('creates canvas overlay with correct class', () => {
        init();
        const canvas = getCanvas();
        expect(canvas).not.toBeNull();
        expect(canvas.tagName).toBe('CANVAS');
    });

    it('returns destroy function', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
        destroyFn = null;
    });

    it('accumulates mouse distance correctly', () => {
        init();
        moveMouseBy(5100);
        const ctx = getCtx();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('draws stage 1 trail at 5000px', () => {
        init();
        moveMouseBy(5100);
        const ctx = getCtx();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.strokeStyle).toBe('#33ff33');
    });

    it('draws stage 2 trail at 10000px with higher alpha', () => {
        init();
        moveMouseBy(10100);
        const ctx = getCtx();
        expect(ctx.lineWidth).toBe(3);
    });

    it('draws stage 3 trail at 20000px with highest alpha', () => {
        init();
        moveMouseBy(20100);
        const ctx = getCtx();
        expect(ctx.lineWidth).toBe(4);
    });

    it('does not draw before 5000px threshold', () => {
        init();
        moveMouseBy(100);
        const ctx = getCtx();
        expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('calls discover ee05 at 20000px', () => {
        init();
        moveMouseBy(20100);
        expect(eeManager.discover).toHaveBeenCalledWith('ee05');
    });

    it('does not double discover', () => {
        init();
        moveMouseBy(20100);
        moveMouseBy(40000);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('shows toast message at 20000px selected by seed', () => {
        eeManager.getSessionSeed = vi.fn().mockReturnValue(0.0);
        init();
        moveMouseBy(20100);
        expect(showToast).toHaveBeenCalledWith('ee_phosphor_10k_1');
    });

    it('selects second message for mid-range seed', () => {
        eeManager.getSessionSeed = vi.fn().mockReturnValue(0.5);
        init();
        moveMouseBy(20100);
        expect(showToast).toHaveBeenCalledWith('ee_phosphor_10k_2');
    });

    it('selects third message for high seed', () => {
        eeManager.getSessionSeed = vi.fn().mockReturnValue(0.9);
        init();
        moveMouseBy(20100);
        expect(showToast).toHaveBeenCalledWith('ee_phosphor_10k_3');
    });

    it('uses t() for message translation', () => {
        init();
        moveMouseBy(20100);
        expect(t).toHaveBeenCalled();
    });

    it('reducedMotion does not draw on canvas', () => {
        init({ reducedMotion: true });
        moveMouseBy(3000);
        const ctx = getCtx();
        expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('reducedMotion still tracks distance and discovers', () => {
        init({ reducedMotion: true });
        moveMouseBy(20100);
        expect(eeManager.discover).toHaveBeenCalledWith('ee05');
    });

    it('reducedMotion shows toast at 20000px', () => {
        init({ reducedMotion: true });
        moveMouseBy(20100);
        expect(showToast).toHaveBeenCalled();
    });

    it('destroy removes canvas from DOM', () => {
        init();
        expect(getCanvas()).not.toBeNull();
        destroyFn();
        destroyFn = null;
        expect(getCanvas()).toBeNull();
    });

    it('destroy stops mouse tracking', () => {
        init();
        destroyFn();
        destroyFn = null;
        moveMouseBy(20100);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy cancels animation frame', () => {
        const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
        init();
        destroyFn();
        destroyFn = null;
        expect(cancelSpy).toHaveBeenCalled();
        cancelSpy.mockRestore();
    });

    it('fade loop calls fillRect for fading while active', () => {
        vi.useFakeTimers();
        init();
        moveMouseBy(5100);
        vi.advanceTimersByTime(16);
        const ctx = getCtx();
        expect(ctx.fillRect).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('handles multiple rapid mouse moves', () => {
        init();
        for (let i = 0; i < 600; i++) {
            moveMouse(i * 10, i);
        }
        const ctx = getCtx();
        expect(ctx.stroke).toHaveBeenCalled();
    });

    it('resize updates canvas dimensions', () => {
        init();
        const canvas = getCanvas();
        const originalWidth = canvas.width;
        window.innerWidth = 1920;
        window.innerHeight = 1080;
        window.dispatchEvent(new Event('resize'));
        expect(canvas.width).toBe(1920);
    });

    it('works without showToast at 20000px', () => {
        init({ showToast: undefined });
        moveMouseBy(20100);
        expect(eeManager.discover).toHaveBeenCalledWith('ee05');
    });

    it('destroy handles already removed canvas', () => {
        init();
        const canvas = getCanvas();
        canvas.remove();
        expect(() => destroyFn()).not.toThrow();
        destroyFn = null;
    });

    it('destroy sets destroyed flag preventing further draws', () => {
        init();
        moveMouseBy(5100);
        const ctx = getCtx();
        const callCount = ctx.stroke.mock.calls.length;
        destroyFn();
        destroyFn = null;
        moveMouseBy(10000);
        expect(ctx.stroke.mock.calls.length).toBe(callCount);
    });

    it('clears canvas completely after inactivity via setTimeout', () => {
        vi.useFakeTimers();
        init();
        moveMouseBy(5100);
        const ctx = getCtx();
        const fillCountBefore = ctx.fillRect.mock.calls.length;
        vi.advanceTimersByTime(1600);
        expect(ctx.clearRect).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('fade loop uses clearRect when idle exceeds delay', () => {
        vi.useFakeTimers();
        init();
        moveMouseBy(5100);
        vi.advanceTimersByTime(1600);
        const ctx = getCtx();
        const clearCount = ctx.clearRect.mock.calls.length;
        expect(clearCount).toBeGreaterThanOrEqual(1);
        vi.useRealTimers();
    });

    it('clearTimer is cancelled on destroy', () => {
        vi.useFakeTimers();
        init();
        moveMouseBy(5100);
        const canvas = getCanvas();
        const ctx = canvas.getContext('2d');
        destroyFn();
        destroyFn = null;
        ctx.clearRect.mockClear();
        vi.advanceTimersByTime(3000);
        expect(ctx.clearRect).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
});
