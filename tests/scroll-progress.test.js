import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initScrollProgress } from '../src/scroll-progress.js';

describe('initScrollProgress', () => {
    let progressBar;
    let progressText;

    beforeEach(() => {
        progressBar = document.createElement('div');
        progressBar.id = 'scrollProgressBar';
        document.body.appendChild(progressBar);

        progressText = document.createElement('span');
        progressText.id = 'scrollProgressText';
        document.body.appendChild(progressText);
    });

    afterEach(() => {
        progressBar.remove();
        progressText.remove();
        vi.restoreAllMocks();
    });

    function fireScroll() {
        window.dispatchEvent(new Event('scroll'));
    }

    it('scroll event updates progress bar width', () => {
        Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, configurable: true });

        initScrollProgress();
        fireScroll();

        expect(progressBar.style.width).toBe('25%');
    });

    it('scroll event updates progress text', () => {
        Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, configurable: true });

        initScrollProgress();
        fireScroll();

        expect(progressText.textContent).toBe('25%');
    });

    it('handles zero document height (0%)', () => {
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, configurable: true });

        initScrollProgress();
        fireScroll();

        expect(progressBar.style.width).toBe('0%');
        expect(progressText.textContent).toBe('0%');
    });

    it('handles full scroll (100%)', () => {
        Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, configurable: true });

        initScrollProgress();
        fireScroll();

        expect(progressBar.style.width).toBe('100%');
        expect(progressText.textContent).toBe('100%');
    });

    it('does not crash when progress elements are absent', () => {
        progressBar.remove();
        progressText.remove();
        expect(() => initScrollProgress()).not.toThrow();
    });

    it('does not attach listener when elements missing', () => {
        progressBar.remove();
        progressText.remove();
        const addSpy = vi.spyOn(window, 'addEventListener');
        initScrollProgress();
        expect(addSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.any(Object));
    });

    it('returns destroy function that removes scroll listener', () => {
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, configurable: true });

        const { destroy } = initScrollProgress();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('returns destroy function when elements missing', () => {
        progressBar.remove();
        progressText.remove();
        const { destroy } = initScrollProgress();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });
});
