import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { blinkSeries, startDegradation } from '../../src/logo-reveal/degradation.js';

function createLogoPre(pixelCount) {
    const pre = document.createElement('pre');
    pre.className = 'nav__logo-ascii';
    for (let i = 0; i < pixelCount; i++) {
        const span = document.createElement('span');
        span.className = 'nav__logo-pixel nav__logo-pixel--visible';
        span.textContent = '#';
        pre.appendChild(span);
    }
    document.body.appendChild(pre);
    return pre;
}

function createSchedule() {
    const timers = [];
    let stopped = false;
    function schedule(fn, delay) {
        if (stopped) return null;
        const id = setTimeout(() => {
            if (!stopped) fn();
        }, delay);
        timers.push(id);
        return id;
    }
    return {
        schedule,
        stop() {
            stopped = true;
            for (const id of timers) clearTimeout(id);
        },
    };
}

describe('degradation', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        try {
            Object.defineProperty(document, 'hidden', {
                value: false,
                writable: true,
                configurable: true,
            });
        } catch (_) {
            // ignored
        }
    });

    describe('blinkSeries', () => {
        it('applies glitch animation to logo', () => {
            const pre = createLogoPre(3);
            const { schedule, stop } = createSchedule();
            blinkSeries(pre, schedule);
            expect(pre.style.animation).toContain('glitch');
            stop();
        });

        it('clears animation after glitch duration', () => {
            const pre = createLogoPre(3);
            const { schedule, stop } = createSchedule();
            blinkSeries(pre, schedule);
            vi.advanceTimersByTime(500);
            expect(pre.style.animation).toBe('');
            stop();
        });

        it('toggles opacity during blink', () => {
            const pre = createLogoPre(3);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            blinkSeries(pre, schedule);
            vi.advanceTimersByTime(501);
            expect(pre.style.opacity).toBe('0');
            vi.advanceTimersByTime(41);
            expect(pre.style.opacity).toBe('1');
            Math.random.mockRestore();
            stop();
        });

        it('calls onComplete after blink series finishes', () => {
            const pre = createLogoPre(3);
            const { schedule, stop } = createSchedule();
            const onComplete = vi.fn();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            blinkSeries(pre, schedule, onComplete);
            vi.advanceTimersByTime(500 + 4 * 80 + 100);
            expect(onComplete).toHaveBeenCalled();
            Math.random.mockRestore();
            stop();
        });

        it('does nothing if pre is disconnected', () => {
            const pre = document.createElement('pre');
            const { schedule, stop } = createSchedule();
            const onComplete = vi.fn();
            blinkSeries(pre, schedule, onComplete);
            expect(pre.style.animation).toBe('');
            expect(onComplete).not.toHaveBeenCalled();
            stop();
        });

        it('stops blinking if pre disconnects mid-sequence', () => {
            const pre = createLogoPre(3);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            blinkSeries(pre, schedule);
            vi.advanceTimersByTime(500);
            pre.remove();
            expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
            Math.random.mockRestore();
            stop();
        });
    });

    describe('startDegradation', () => {
        it('degrades visible pixels after delay', () => {
            const pre = createLogoPre(20);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            startDegradation(pre, schedule, () => false);
            vi.advanceTimersByTime(30000 + 500 + 4 * 80 + 100);
            const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
            expect(visible).toBeLessThan(20);
            Math.random.mockRestore();
            stop();
        });

        it('reschedules when document.hidden is true', () => {
            const pre = createLogoPre(20);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            startDegradation(pre, schedule, () => false);
            vi.advanceTimersByTime(30000);
            expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);
            Object.defineProperty(document, 'hidden', { value: false, configurable: true });
            vi.advanceTimersByTime(30000 + 500 + 4 * 80 + 100);
            const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
            expect(visible).toBeLessThan(20);
            Math.random.mockRestore();
            stop();
        });

        it('stops when getDestroyed returns true', () => {
            const pre = createLogoPre(20);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            let destroyed = false;
            startDegradation(pre, schedule, () => destroyed);
            destroyed = true;
            vi.advanceTimersByTime(300000);
            expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);
            Math.random.mockRestore();
            stop();
        });

        it('recovers pixels after broken pause', () => {
            const pre = createLogoPre(20);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            startDegradation(pre, schedule, () => false);
            vi.advanceTimersByTime(30000 + 500 + 4 * 80 + 100);
            const afterBlink = pre.querySelectorAll('.nav__logo-pixel--visible').length;
            expect(afterBlink).toBeLessThan(20);
            vi.advanceTimersByTime(3000 + 500 + 4 * 80 + 100 + 200);
            const afterRecovery = pre.querySelectorAll('.nav__logo-pixel--visible').length;
            expect(afterRecovery).toBe(20);
            Math.random.mockRestore();
            stop();
        });

        it('skips when no visible pixels remain', () => {
            const pre = createLogoPre(2);
            pre.querySelectorAll('.nav__logo-pixel').forEach((p) => {
                p.classList.remove('nav__logo-pixel--visible');
            });
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            expect(() => {
                startDegradation(pre, schedule, () => false);
                vi.advanceTimersByTime(100000);
            }).not.toThrow();
            Math.random.mockRestore();
            stop();
        });

        it('handles disconnected pre element', () => {
            const pre = createLogoPre(20);
            const { schedule, stop } = createSchedule();
            vi.spyOn(Math, 'random').mockReturnValue(0);
            startDegradation(pre, schedule, () => false);
            pre.remove();
            expect(() => vi.advanceTimersByTime(100000)).not.toThrow();
            Math.random.mockRestore();
            stop();
        });
    });
});
