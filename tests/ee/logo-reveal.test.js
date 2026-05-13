import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initLogoReveal } from '../../src/ee/logo-reveal.js';

function createLogoPre(text) {
    const pre = document.createElement('pre');
    pre.className = 'nav__logo-ascii';
    pre.textContent = text;
    pre.setAttribute('data-glitch', '');
    pre.style.setProperty('--gd', '6s');
    pre.style.setProperty('--gdur', '6s');
    document.body.appendChild(pre);
    return pre;
}

describe('logo-reveal', () => {
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
        }
    });

    it('wraps # characters in spans with correct class and data-pi', () => {
        const pre = createLogoPre('## ab ##');
        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(4);
        expect(pixels[0].getAttribute('data-pi')).toBe('0');
        expect(pixels[1].getAttribute('data-pi')).toBe('1');
        expect(pixels[2].getAttribute('data-pi')).toBe('2');
        expect(pixels[3].getAttribute('data-pi')).toBe('3');
        for (const px of pixels) {
            expect(px.textContent).toBe('#');
        }
    });

    it('returns early if no .nav__logo-ascii element exists', () => {
        document.body.innerHTML = '';
        const result = initLogoReveal();
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
    });

    it('returns { destroy() }', () => {
        createLogoPre('###');
        const result = initLogoReveal();
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
    });

    it('removes data-glitch attribute and CSS custom properties during init', () => {
        const pre = createLogoPre('###');
        expect(pre.hasAttribute('data-glitch')).toBe(true);

        initLogoReveal();

        expect(pre.hasAttribute('data-glitch')).toBe(false);
        expect(pre.style.getPropertyValue('--gd')).toBe('');
        expect(pre.style.getPropertyValue('--gdur')).toBe('');
    });

    it('reveals tease pixels after 600ms', () => {
        const pre = createLogoPre('##########');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        vi.advanceTimersByTime(601);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBe(4);
    });

    it('reveals all pixels after full assembly', () => {
        const pre = createLogoPre('##########');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        vi.advanceTimersByTime(1801);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBe(10);
    });

    it('applies glitch animation after assembly (Phase 2)', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        vi.advanceTimersByTime(5701);

        expect(pre.style.animation).toBe('glitch 0.5s ease-in-out');
    });

    it('performs blink series after glitch animation', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        // glitch applied at 5700ms, removed at 6200ms, first blink at 6200ms
        vi.advanceTimersByTime(6201);
        expect(pre.style.opacity).toBe('0');

        vi.advanceTimersByTime(41);
        expect(pre.style.opacity).toBe('1');
    });

    it('skips Phase 2 and 3 with reducedMotion=true', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal(true);

        vi.advanceTimersByTime(100000);

        expect(pre.style.animation).toBe('');
        expect(pre.style.opacity).toBe('1');
    });

    it('fires periodic degradation after delay (Phase 3)', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        // Phase 2 ends ~6620ms, degradation delay 30000ms → fires at ~36620ms
        // Advance into pixel removal: 36620 + 800 = 37420ms
        vi.advanceTimersByTime(37420);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBeLessThan(20);
    });

    it('skips degradation when document.hidden is true', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        Object.defineProperty(document, 'hidden', {
            value: true,
            configurable: true,
        });

        initLogoReveal();

        // Advance past first degradation timer (36620ms)
        vi.advanceTimersByTime(40000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);

        Object.defineProperty(document, 'hidden', {
            value: false,
            configurable: true,
        });

        // Rescheduled degradation fires at 66620ms, advance into removal phase
        vi.advanceTimersByTime(28000);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBeLessThan(20);
    });

    it('stops degradation after destroy()', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const { destroy } = initLogoReveal();

        vi.advanceTimersByTime(7000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);

        destroy();

        vi.advanceTimersByTime(300000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);
    });

    it('handles missing pixels gracefully during degradation', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        initLogoReveal();

        vi.advanceTimersByTime(7000);
        pre.innerHTML = 'no pixels here';

        expect(() => vi.advanceTimersByTime(35000)).not.toThrow();
    });

    it('preserves non-hash characters', () => {
        const pre = createLogoPre(' # \n # ');
        initLogoReveal();

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(2);
        expect(pre.innerHTML).toContain(' ');
        expect(pre.innerHTML).toContain('\n');
    });
});
