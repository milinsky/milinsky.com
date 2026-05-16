import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getState, setState, subscribe } from '../src/state.js';

describe('state', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('lang', 'en');
        localStorage.setItem('theme', 'light');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('getState returns initial lang from localStorage', () => {
        expect(getState('lang')).toBe('ru');
    });

    it('getState returns initial theme from localStorage', () => {
        expect(getState('theme')).toBe('dark');
    });

    it('setState updates value and getState returns it', () => {
        setState('lang', 'ru');
        expect(getState('lang')).toBe('ru');
    });

    it('setState notifies subscribers for matching key', () => {
        const callback = vi.fn();
        subscribe('lang', callback);
        setState('lang', 'ru');
        expect(callback).toHaveBeenCalledWith('ru');
    });

    it('subscribe returns unsubscribe function', () => {
        const callback = vi.fn();
        const unsub = subscribe('lang', callback);
        expect(unsub).toBeTypeOf('function');
    });

    it('unsubscribe stops notifications', () => {
        const callback = vi.fn();
        const unsub = subscribe('lang', callback);
        unsub();
        setState('lang', 'ru');
        expect(callback).not.toHaveBeenCalled();
    });

    it('multiple subscribers on same key all get called', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        subscribe('lang', cb1);
        subscribe('lang', cb2);
        setState('lang', 'ru');
        expect(cb1).toHaveBeenCalledWith('ru');
        expect(cb2).toHaveBeenCalledWith('ru');
    });

    it('subscribers for different keys are not called', () => {
        const langCb = vi.fn();
        subscribe('theme', langCb);
        setState('lang', 'ru');
        expect(langCb).not.toHaveBeenCalled();
    });

    it('setState with same value still notifies', () => {
        const callback = vi.fn();
        subscribe('lang', callback);
        setState('lang', 'en');
        expect(callback).toHaveBeenCalledWith('en');
    });

    it('unsubscribed callback does not affect other subscribers', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const unsub1 = subscribe('lang', cb1);
        subscribe('lang', cb2);
        unsub1();
        setState('lang', 'ru');
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).toHaveBeenCalledWith('ru');
    });
});
