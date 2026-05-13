import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEeManager } from '../src/ee-manager.js';

describe('ee-manager', () => {
    it('creates manager with all methods', () => {
        const mgr = createEeManager();
        expect(mgr.discover).toBeTypeOf('function');
        expect(mgr.isDiscovered).toBeTypeOf('function');
        expect(mgr.getVisitCount).toBeTypeOf('function');
        expect(mgr.getSessionSeed).toBeTypeOf('function');
        expect(mgr.getDailySeed).toBeTypeOf('function');
    });

    it('tracks discovery', () => {
        const mgr = createEeManager();
        expect(mgr.isDiscovered('test-ee')).toBe(false);
        mgr.discover('test-ee');
        expect(mgr.isDiscovered('test-ee')).toBe(true);
    });

    it('does not duplicate discovery', () => {
        const mgr = createEeManager();
        mgr.discover('test-ee');
        mgr.discover('test-ee');
        expect(mgr.isDiscovered('test-ee')).toBe(true);
    });

    it('records visit count', () => {
        localStorage.clear();
        const mgr = createEeManager();
        expect(mgr.getVisitCount()).toBeGreaterThan(0);
    });

    it('returns session seed as number', () => {
        const mgr = createEeManager();
        expect(mgr.getSessionSeed()).toBeTypeOf('number');
        expect(mgr.getSessionSeed()).toBeGreaterThanOrEqual(0);
        expect(mgr.getSessionSeed()).toBeLessThan(1);
    });

    it('returns daily seed as positive number', () => {
        const mgr = createEeManager();
        expect(mgr.getDailySeed()).toBeTypeOf('number');
        expect(mgr.getDailySeed()).toBeGreaterThan(0);
    });

    it('persists discovery to localStorage', () => {
        const mgr = createEeManager();
        mgr.discover('persist-test');
        const stored = JSON.parse(localStorage.getItem('ee_discovered'));
        expect(stored).toContain('persist-test');
    });

    describe('localStorage error handling', () => {
        let origGetItem;
        let origSetItem;

        beforeEach(() => {
            origGetItem = localStorage.getItem.bind(localStorage);
            origSetItem = localStorage.setItem.bind(localStorage);
        });

        afterEach(() => {
            localStorage.getItem = origGetItem;
            localStorage.setItem = origSetItem;
        });

        it('handles localStorage.getItem throwing in constructor', () => {
            localStorage.getItem = vi.fn(() => { throw new Error('storage blocked'); });
            const mgr = createEeManager();
            expect(mgr.isDiscovered('anything')).toBe(false);
            mgr.discover('test-after-error');
            expect(mgr.isDiscovered('test-after-error')).toBe(true);
        });

        it('handles localStorage.setItem throwing in discover', () => {
            localStorage.setItem = vi.fn((key, value) => {
                if (key === 'ee_discovered') throw new Error('quota exceeded');
                origSetItem(key, value);
            });
            const mgr = createEeManager();
            expect(() => mgr.discover('fail-save')).not.toThrow();
            expect(mgr.isDiscovered('fail-save')).toBe(true);
        });

        it('handles localStorage.getItem throwing in recordVisit', () => {
            let callCount = 0;
            localStorage.getItem = vi.fn((key) => {
                callCount++;
                if (key === 'ee_visit_count') throw new Error('blocked');
                return origGetItem(key);
            });
            const mgr = createEeManager();
            expect(mgr.getVisitCount()).toBe(0);
        });

        it('handles localStorage.setItem throwing in recordVisit', () => {
            localStorage.clear();
            localStorage.setItem = vi.fn((key, value) => {
                if (key === 'ee_visit_count') throw new Error('quota');
                origSetItem(key, value);
            });
            const mgr = createEeManager();
            expect(mgr.getVisitCount()).toBe(0);
        });

        it('handles localStorage.getItem throwing in getVisitCount', () => {
            localStorage.getItem = vi.fn((key) => {
                if (key === 'ee_visit_count') throw new Error('blocked');
                return origGetItem(key);
            });
            const mgr = createEeManager();
            expect(mgr.getVisitCount()).toBe(0);
        });

        it('handles NaN from localStorage visit count', () => {
            localStorage.clear();
            origSetItem('ee_visit_count', 'not-a-number');
            localStorage.getItem = origGetItem;
            const mgr = createEeManager();
            expect(mgr.getVisitCount()).toBe(1);
        });

        it('handles NaN in getVisitCount', () => {
            localStorage.clear();
            origSetItem('ee_visit_count', 'abc');
            localStorage.getItem = origGetItem;
            const mgr = createEeManager();
            expect(typeof mgr.getVisitCount()).toBe('number');
            expect(isNaN(mgr.getVisitCount())).toBe(false);
        });

        it('sets first visit date on first visit', () => {
            localStorage.clear();
            const mgr = createEeManager();
            const firstVisit = localStorage.getItem('ee_first_visit');
            expect(firstVisit).not.toBeNull();
        });

        it('does not overwrite first visit date on subsequent visits', () => {
            localStorage.clear();
            const mgr1 = createEeManager();
            const firstVisit1 = localStorage.getItem('ee_first_visit');
            const mgr2 = createEeManager();
            const firstVisit2 = localStorage.getItem('ee_first_visit');
            expect(firstVisit1).toBe(firstVisit2);
        });
    });
});
