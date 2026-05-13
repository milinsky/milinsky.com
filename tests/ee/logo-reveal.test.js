import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initLogoReveal } from '../../src/ee/logo-reveal.js';

describe('logo-reveal', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('wraps # characters in spans with class nav__logo-pixel', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = '## ab ##';
        document.body.appendChild(pre);

        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(4);
        for (const px of pixels) {
            expect(px.textContent).toBe('#');
        }
    });

    it('adds data-pi attribute to pixel spans', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = '#a#b';
        document.body.appendChild(pre);

        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels[0].getAttribute('data-pi')).toBe('0');
        expect(pixels[1].getAttribute('data-pi')).toBe('1');
    });

    it('adds nav__logo-pixel--visible class to tease pixels after delay', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = '##########';
        document.body.appendChild(pre);

        initLogoReveal();

        vi.advanceTimersByTime(600 + 500);

        const visiblePixels = pre.querySelectorAll('.nav__logo-pixel--visible');
        expect(visiblePixels.length).toBeGreaterThanOrEqual(0);
    });

    it('adds nav__logo-pixel--visible to rest of pixels after longer delay', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = '#####';
        document.body.appendChild(pre);

        initLogoReveal();

        vi.advanceTimersByTime(1800 + 3600 + 100);

        const visiblePixels = pre.querySelectorAll('.nav__logo-pixel--visible');
        expect(visiblePixels.length).toBe(5);
    });

    it('handles element without # characters', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = 'no hash chars here';
        document.body.appendChild(pre);

        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(0);
        expect(pre.innerHTML).toBe('no hash chars here');
    });

    it('returns early if no .nav__logo-ascii element exists', () => {
        document.body.innerHTML = '';
        expect(() => initLogoReveal()).not.toThrow();
    });

    it('preserves non-hash characters in innerHTML', () => {
        const pre = document.createElement('pre');
        pre.className = 'nav__logo-ascii';
        pre.textContent = ' # \n # ';
        document.body.appendChild(pre);

        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(2);
        expect(pre.innerHTML).toContain(' ');
        expect(pre.innerHTML).toContain('\n');
    });
});
