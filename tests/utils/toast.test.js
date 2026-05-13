import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showToast } from '../../src/utils/toast.js';

describe('showToast', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('creates element with class ee-toast', () => {
        showToast('test message');
        const toast = document.querySelector('.ee-toast');
        expect(toast).not.toBeNull();
        expect(toast.classList.contains('ee-toast')).toBe(true);
    });

    it('sets textContent to the message', () => {
        showToast('hello world');
        const toast = document.querySelector('.ee-toast');
        expect(toast.textContent).toBe('hello world');
    });

    it('appends element to document.body', () => {
        showToast('body test');
        const toasts = document.body.querySelectorAll('.ee-toast');
        expect(toasts.length).toBe(1);
        expect(document.body.contains(toasts[0])).toBe(true);
    });

    it('adds ee-toast--visible class after 10ms', () => {
        showToast('visible test');
        const toast = document.querySelector('.ee-toast');

        expect(toast.classList.contains('ee-toast--visible')).toBe(false);

        vi.advanceTimersByTime(10);
        expect(toast.classList.contains('ee-toast--visible')).toBe(true);
    });

    it('removes ee-toast--visible class after default duration (3000ms)', () => {
        showToast('duration test');
        const toast = document.querySelector('.ee-toast');

        vi.advanceTimersByTime(10);
        expect(toast.classList.contains('ee-toast--visible')).toBe(true);

        vi.advanceTimersByTime(3000);
        expect(toast.classList.contains('ee-toast--visible')).toBe(false);
    });

    it('removes element from DOM 300ms after hiding', () => {
        showToast('remove test');
        const toast = document.querySelector('.ee-toast');
        expect(document.body.contains(toast)).toBe(true);

        vi.advanceTimersByTime(10);
        vi.advanceTimersByTime(3000);
        expect(toast.classList.contains('ee-toast--visible')).toBe(false);

        expect(document.body.contains(toast)).toBe(true);
        vi.advanceTimersByTime(300);
        expect(document.body.contains(toast)).toBe(false);
    });

    it('uses custom duration parameter', () => {
        showToast('custom', 1000);
        const toast = document.querySelector('.ee-toast');

        vi.advanceTimersByTime(10);
        expect(toast.classList.contains('ee-toast--visible')).toBe(true);

        vi.advanceTimersByTime(1000);
        expect(toast.classList.contains('ee-toast--visible')).toBe(false);
    });

    it('allows multiple toasts to coexist', () => {
        showToast('first');
        showToast('second');
        showToast('third');

        const toasts = document.querySelectorAll('.ee-toast');
        expect(toasts).toHaveLength(3);

        const texts = Array.from(toasts).map((t) => t.textContent);
        expect(texts).toContain('first');
        expect(texts).toContain('second');
        expect(texts).toContain('third');
    });

    it('removes each toast independently after its own duration', () => {
        showToast('short', 500);
        showToast('long', 2000);

        const beforeAdvance = document.querySelectorAll('.ee-toast');
        expect(beforeAdvance).toHaveLength(2);

        vi.advanceTimersByTime(10);
        vi.advanceTimersByTime(500);

        const afterFirst = document.querySelectorAll('.ee-toast');
        expect(afterFirst).toHaveLength(2);

        vi.advanceTimersByTime(300);
        const afterShortRemoved = document.querySelectorAll('.ee-toast');
        expect(afterShortRemoved).toHaveLength(1);
        expect(afterShortRemoved[0].textContent).toBe('long');
    });
});
