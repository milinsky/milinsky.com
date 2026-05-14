import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setState } from '../../src/state.js';
import { createThemeSpeedrun } from '../../src/ee/theme-speedrun.js';

describe('theme-speedrun', () => {
    let eeManager;
    let t;
    let showToast;
    let nowValue;
    let instance;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        document.documentElement.classList.remove('ee-geocities');
        eeManager = { discover: vi.fn() };
        t = vi.fn((key) => key);
        showToast = vi.fn();
        nowValue = 1000000;
        vi.spyOn(Date, 'now').mockImplementation(() => nowValue);
    });

    afterEach(() => {
        if (instance) {
            instance.destroy();
            instance = null;
        }
        document.documentElement.classList.remove('ee-geocities');
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function fastToggle(count) {
        for (let i = 0; i < count; i++) {
            setState('theme', `val-${i}`);
        }
    }

    it('returns destroy function', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        expect(instance.destroy).toBeTypeOf('function');
    });

    it('activates on 5 toggles within 3 seconds', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(true);
    });

    it('calls discover with ee10 on activation', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(eeManager.discover).toHaveBeenCalledWith('ee10');
    });

    it('does not activate when toggles are slow', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        for (let i = 0; i < 4; i++) {
            setState('theme', `val-${i}`);
            nowValue += 2000;
        }
        setState('theme', 'val-4');
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(false);
        expect(showToast).not.toHaveBeenCalled();
    });

    it('does not call discover on second activation', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        fastToggle(5);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('skips visual effects when reducedMotion is true', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: true });
        fastToggle(5);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(false);
        expect(eeManager.discover).toHaveBeenCalledWith('ee10');
        expect(showToast).toHaveBeenCalledWith('ee_speedrun_recovered', 8000);
    });

    it('shows toast after geocities effect ends', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(showToast).not.toHaveBeenCalled();
        vi.advanceTimersByTime(30000);
        expect(showToast).toHaveBeenCalledWith('ee_speedrun_recovered', 8000);
        expect(t).toHaveBeenCalledWith('ee_speedrun_recovered');
    });

    it('adds geocities class to html element', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(true);
    });

    it('removes geocities class after timeout', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(true);
        vi.advanceTimersByTime(30000);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(false);
    });

    it('destroy clears timers so geocities class persists', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(true);
        instance.destroy();
        instance = null;
        vi.advanceTimersByTime(30000);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(true);
    });

    it('does not react to theme changes after destroy', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        instance.destroy();
        instance = null;
        fastToggle(5);
        expect(eeManager.discover).not.toHaveBeenCalled();
        expect(showToast).not.toHaveBeenCalled();
    });

    it('does not activate with fewer than 5 toggles', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(4);
        expect(document.documentElement.classList.contains('ee-geocities')).toBe(false);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('reset timestamps after activation prevents immediate re-trigger', () => {
        instance = createThemeSpeedrun({ eeManager, t, showToast, reducedMotion: false });
        fastToggle(5);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        setState('theme', 'extra');
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });
});
