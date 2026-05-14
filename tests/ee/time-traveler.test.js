import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimeTraveler } from '../../src/ee/time-traveler.js';

describe('time-traveler', () => {
    let eeManager;
    let t;
    let showToast;
    let instance;

    const THEMED_CLASSES = ['ee-time-bios', 'ee-time-april', 'ee-time-halloween', 'ee-time-christmas', 'ee-time-anomaly'];

    beforeEach(() => {
        document.documentElement.className = '';
        eeManager = { discover: vi.fn() };
        t = vi.fn((key) => key);
        showToast = vi.fn();
    });

    afterEach(() => {
        if (instance) {
            instance.destroy();
            instance = null;
        }
        document.documentElement.className = '';
        vi.restoreAllMocks();
    });

    function init(dateOverride) {
        instance = createTimeTraveler({ eeManager, t, showToast, dateOverride });
        return instance;
    }

    it('returns destroy function', () => {
        init(new Date('2026-06-15'));
        expect(instance.destroy).toBeTypeOf('function');
        expect(() => instance.destroy()).not.toThrow();
    });

    it('adds no class on normal date', () => {
        init(new Date('2026-06-15'));
        for (const cls of THEMED_CLASSES) {
            expect(document.documentElement.classList.contains(cls)).toBe(false);
        }
    });

    it('does not call discover on normal date', () => {
        init(new Date('2026-06-15'));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('maps Jan 1 to ee-time-bios', () => {
        init(new Date('2026-01-01'));
        expect(document.documentElement.classList.contains('ee-time-bios')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_time_bios');
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('maps Apr 1 to ee-time-april', () => {
        init(new Date('2026-04-01'));
        expect(document.documentElement.classList.contains('ee-time-april')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_time_april');
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('maps Oct 31 to ee-time-halloween', () => {
        init(new Date('2026-10-31'));
        expect(document.documentElement.classList.contains('ee-time-halloween')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_time_halloween');
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('maps Dec 25 to ee-time-christmas', () => {
        init(new Date('2026-12-25'));
        expect(document.documentElement.classList.contains('ee-time-christmas')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_time_christmas');
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('detects anomaly for year before 1990', () => {
        init(new Date('1985-06-15'));
        expect(document.documentElement.classList.contains('ee-time-anomaly')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_time_anomaly');
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('detects anomaly for year 1900', () => {
        init(new Date('1900-01-01'));
        expect(document.documentElement.classList.contains('ee-time-anomaly')).toBe(true);
        expect(eeManager.discover).toHaveBeenCalledWith('ee15');
    });

    it('does not trigger anomaly at exactly year 1990', () => {
        init(new Date('1990-06-15'));
        for (const cls of THEMED_CLASSES) {
            expect(document.documentElement.classList.contains(cls)).toBe(false);
        }
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy removes bios class', () => {
        init(new Date('2026-01-01'));
        expect(document.documentElement.classList.contains('ee-time-bios')).toBe(true);
        instance.destroy();
        instance = null;
        expect(document.documentElement.classList.contains('ee-time-bios')).toBe(false);
    });

    it('destroy removes april class', () => {
        init(new Date('2026-04-01'));
        instance.destroy();
        instance = null;
        expect(document.documentElement.classList.contains('ee-time-april')).toBe(false);
    });

    it('destroy removes halloween class', () => {
        init(new Date('2026-10-31'));
        instance.destroy();
        instance = null;
        expect(document.documentElement.classList.contains('ee-time-halloween')).toBe(false);
    });

    it('destroy removes christmas class', () => {
        init(new Date('2026-12-25'));
        instance.destroy();
        instance = null;
        expect(document.documentElement.classList.contains('ee-time-christmas')).toBe(false);
    });

    it('destroy removes anomaly class', () => {
        init(new Date('1980-01-01'));
        instance.destroy();
        instance = null;
        expect(document.documentElement.classList.contains('ee-time-anomaly')).toBe(false);
    });

    it('uses current date when no dateOverride provided', () => {
        instance = createTimeTraveler({ eeManager, t, showToast });
        expect(instance.destroy).toBeTypeOf('function');
    });

    it('calls t with correct translation key for halloween', () => {
        init(new Date('2026-10-31'));
        expect(t).toHaveBeenCalledWith('ee_time_halloween');
    });

    it('calls t with correct translation key for christmas', () => {
        init(new Date('2026-12-25'));
        expect(t).toHaveBeenCalledWith('ee_time_christmas');
    });

    it('shows toast on every themed date', () => {
        const dates = [
            new Date('2026-01-01'),
            new Date('2026-04-01'),
            new Date('2026-10-31'),
            new Date('2026-12-25'),
            new Date('1970-01-01'),
        ];
        for (const date of dates) {
            if (instance) {
                instance.destroy();
                instance = null;
            }
            showToast.mockClear();
            eeManager.discover.mockClear();
            init(date);
            expect(showToast).toHaveBeenCalledTimes(1);
            expect(eeManager.discover).toHaveBeenCalledTimes(1);
        }
    });
});
