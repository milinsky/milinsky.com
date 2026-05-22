import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogoReveal } from '../src/logo-reveal.js';

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
        createLogoReveal({});

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
        const result = createLogoReveal({});
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
    });

    it('returns { destroy() }', () => {
        createLogoPre('###');
        const result = createLogoReveal({});
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
    });

    it('removes data-glitch attribute and CSS custom properties during init', () => {
        const pre = createLogoPre('###');
        expect(pre.hasAttribute('data-glitch')).toBe(true);

        createLogoReveal({});

        expect(pre.hasAttribute('data-glitch')).toBe(false);
        expect(pre.style.getPropertyValue('--gd')).toBe('');
        expect(pre.style.getPropertyValue('--gdur')).toBe('');
    });

    it('reveals tease pixels after 600ms', () => {
        const pre = createLogoPre('##########');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(601);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBe(4);
    });

    it('reveals all pixels after full assembly', () => {
        const pre = createLogoPre('##########');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(1801);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBe(10);
    });

    it('applies glitch animation after assembly (Phase 2)', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(5701);

        expect(pre.style.animation).toContain('glitch');
    });

    it('performs blink series after glitch animation', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(6201);
        expect(pre.style.opacity).toBe('0');

        vi.advanceTimersByTime(41);
        expect(pre.style.opacity).toBe('1');
    });

    it('skips Phase 2 and 3 with reducedMotion=true', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({ reducedMotion: true });

        vi.advanceTimersByTime(100000);

        expect(pre.style.animation).toBe('');
        expect(pre.style.opacity).toBe('1');
    });

    it('destroy with reducedMotion clears timers', () => {
        createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const { destroy } = createLogoReveal({ reducedMotion: true });

        vi.advanceTimersByTime(600);
        destroy();
        expect(() => vi.advanceTimersByTime(100000)).not.toThrow();

        Math.random.mockRestore();
    });

    it('fires periodic degradation after delay (Phase 3)', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(39000);

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

        createLogoReveal({});

        vi.advanceTimersByTime(40000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);

        Object.defineProperty(document, 'hidden', {
            value: false,
            configurable: true,
        });

        vi.advanceTimersByTime(28000);

        const visible = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(visible).toBeLessThan(20);
    });

    it('stops degradation after destroy()', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const { destroy } = createLogoReveal({});

        vi.advanceTimersByTime(7000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);

        destroy();

        vi.advanceTimersByTime(300000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);
    });

    it('handles missing pixels gracefully during degradation', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(7000);
        pre.innerHTML = 'no pixels here';

        expect(() => vi.advanceTimersByTime(35000)).not.toThrow();
    });

    it('preserves non-hash characters', () => {
        const pre = createLogoPre(' # \n # ');
        createLogoReveal({});

        const pixels = pre.querySelectorAll('.nav__logo-pixel');
        expect(pixels.length).toBe(2);
        expect(pre.innerHTML).toContain(' ');
        expect(pre.innerHTML).toContain('\n');
    });

    it('returns early with empty destroy when no # pixels found', () => {
        createLogoPre('   ');
        const result = createLogoReveal({});
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
    });

    it('degradation cycle recovers pixels after broken pause', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(5700 + 500 + 4 * 80 + 100 + 30000 + 500 + 4 * 80 + 100);
        const afterBlink = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(afterBlink).toBeLessThan(20);

        vi.advanceTimersByTime(3000 + 500 + 4 * 80 + 100 + 200);
        const afterRecovery = pre.querySelectorAll('.nav__logo-pixel--visible').length;
        expect(afterRecovery).toBe(20);

        Math.random.mockRestore();
    });

    it('degradation skips when no visible pixels remain', () => {
        const pre = createLogoPre('##');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(1801);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(2);

        pre.querySelectorAll('.nav__logo-pixel').forEach((p) => {
            p.classList.remove('nav__logo-pixel--visible');
        });

        vi.advanceTimersByTime(100000);
        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(0);

        Math.random.mockRestore();
    });

    it('degradation handles disconnected pre element', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(7000);
        pre.remove();

        expect(() => vi.advanceTimersByTime(100000)).not.toThrow();

        Math.random.mockRestore();
    });

    it('blink series handles disconnected pre', () => {
        const pre = createLogoPre('#####');
        vi.spyOn(Math, 'random').mockReturnValue(0);
        createLogoReveal({});

        vi.advanceTimersByTime(5700);
        pre.remove();

        expect(() => vi.advanceTimersByTime(5000)).not.toThrow();

        Math.random.mockRestore();
    });

    it('full degradation cycle with blink and recovery', () => {
        const pre = createLogoPre('####################');
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        createLogoReveal({});

        vi.advanceTimersByTime(5700 + 500 + 4 * 80 + 100 + 30000 + 500 + 4 * 80 + 100 + 3000 + 500 + 4 * 80 + 100 + 200);

        expect(pre.querySelectorAll('.nav__logo-pixel--visible').length).toBe(20);

        Math.random.mockRestore();
    });
});
