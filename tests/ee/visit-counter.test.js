import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initVisitCounter } from '../../src/ee/visit-counter.js';

describe('visit-counter', () => {
    let eeManager;
    let eeT;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';

        const frame = document.createElement('div');
        frame.className = 'hero__terminal-frame';
        document.body.appendChild(frame);

        eeManager = {
            getVisitCount: vi.fn(),
        };
        eeT = vi.fn((key) => {
            const map = {
                ee_visit_2: 'Back again! Visit #N',
                ee_visit_5: 'Regular visitor! #N times',
                ee_visit_10: 'You really like this place!',
                ee_visit_20: 'Legendary! #N visits and counting',
            };
            return map[key] ?? key;
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns early if visitCount < 2', () => {
        eeManager.getVisitCount.mockReturnValue(1);
        initVisitCounter(eeManager, eeT);
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('returns early if visitCount is 0', () => {
        eeManager.getVisitCount.mockReturnValue(0);
        initVisitCounter(eeManager, eeT);
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('creates .ee-visit-msg element', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        initVisitCounter(eeManager, eeT);
        expect(document.querySelector('.ee-visit-msg')).not.toBeNull();
    });

    it('uses correct message for 2-4 visits', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        initVisitCounter(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_visit_2');
    });

    it('uses correct message for 5-9 visits', () => {
        eeManager.getVisitCount.mockReturnValue(7);
        initVisitCounter(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_visit_5');
    });

    it('uses correct message for 10-19 visits', () => {
        eeManager.getVisitCount.mockReturnValue(15);
        initVisitCounter(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_visit_10');
    });

    it('uses correct message for 20+ visits', () => {
        eeManager.getVisitCount.mockReturnValue(25);
        initVisitCounter(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_visit_20');
    });

    it('replaces #N with visit count', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        initVisitCounter(eeManager, eeT);
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(5000);
        expect(msgEl.textContent).toContain('3');
    });

    it('types message character by character', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        initVisitCounter(eeManager, eeT);
        const msgEl = document.querySelector('.ee-visit-msg');
        const afterOne = msgEl.textContent.length;
        vi.advanceTimersByTime(50);
        const afterTwo = msgEl.textContent.length;
        expect(afterTwo).toBeGreaterThanOrEqual(afterOne);
    });

    it('completes full message after all timeouts', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        initVisitCounter(eeManager, eeT);
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('3');
    });

    it('returns early if no .hero__terminal-frame', () => {
        document.body.innerHTML = '';
        eeManager.getVisitCount.mockReturnValue(5);
        expect(() => initVisitCounter(eeManager, eeT)).not.toThrow();
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('appends message element to terminal frame', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        initVisitCounter(eeManager, eeT);
        const frame = document.querySelector('.hero__terminal-frame');
        const msgEl = frame.querySelector('.ee-visit-msg');
        expect(msgEl).not.toBeNull();
    });

    it('replaces #N with visit count for 5-9 range', () => {
        eeManager.getVisitCount.mockReturnValue(7);
        initVisitCounter(eeManager, eeT);
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('7');
    });

    it('replaces #N with visit count for 20+ range', () => {
        eeManager.getVisitCount.mockReturnValue(42);
        initVisitCounter(eeManager, eeT);
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('42');
    });
});
