import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initVisualEffects } from '../src/visual-effects.js';

function createVisualEffectsDOM() {
    document.body.innerHTML = '';

    const card1 = document.createElement('div');
    card1.className = 'retro-card';
    document.body.appendChild(card1);

    const card2 = document.createElement('div');
    card2.className = 'retro-card';
    document.body.appendChild(card2);

    const crtNoise = document.createElement('div');
    crtNoise.id = 'crtNoise';
    document.body.appendChild(crtNoise);

    const label1 = document.createElement('div');
    label1.className = 'section__label';
    label1.setAttribute('data-section', 'about');
    label1.textContent = 'ABOUT';
    document.body.appendChild(label1);

    const label2 = document.createElement('div');
    label2.className = 'section__label';
    label2.setAttribute('data-section', 'services');
    label2.textContent = 'SERVICES';
    document.body.appendChild(label2);

    return { card1, card2, crtNoise, label1, label2 };
}

describe('initVisualEffects', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('adds scanline spans to .retro-card elements', () => {
        const { card1, card2 } = createVisualEffectsDOM();
        initVisualEffects([]);

        const scanlines1 = card1.querySelectorAll('.card-scanline');
        const scanlines2 = card2.querySelectorAll('.card-scanline');

        expect(scanlines1.length).toBe(1);
        expect(scanlines2.length).toBe(1);
    });

    it('scanlines have class card-scanline and aria-hidden true', () => {
        const { card1 } = createVisualEffectsDOM();
        initVisualEffects([]);

        const scanline = card1.querySelector('.card-scanline');
        expect(scanline).toBeDefined();
        expect(scanline.getAttribute('aria-hidden')).toBe('true');
    });

    it('CRT noise loop runs and activates crtNoise element', () => {
        const { crtNoise } = createVisualEffectsDOM();

        vi.spyOn(Math, 'random').mockReturnValue(0);

        initVisualEffects([]);

        vi.advanceTimersByTime(3000);

        expect(crtNoise.style.top).toBeTruthy();
        expect(crtNoise.classList.contains('crt-noise--active')).toBe(true);

        vi.advanceTimersByTime(250);
        expect(crtNoise.classList.contains('crt-noise--active')).toBe(false);

        Math.random.mockRestore();
    });

    it('CRT noise skips when document is hidden', () => {
        const { crtNoise } = createVisualEffectsDOM();

        vi.spyOn(Math, 'random').mockReturnValue(0);
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });

        initVisualEffects([]);

        vi.advanceTimersByTime(3000);

        expect(crtNoise.style.top).toBe('');

        vi.advanceTimersByTime(1000);
        expect(crtNoise.style.top).toBe('');

        Math.random.mockRestore();
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    });

    it('section label rotation changes text then restores', () => {
        const { label1 } = createVisualEffectsDOM();
        const originalText = label1.textContent;

        vi.spyOn(Math, 'random').mockReturnValue(0);

        initVisualEffects([label1]);

        vi.advanceTimersByTime(4000);

        expect(label1.textContent).not.toBe(originalText);
        expect(label1.textContent).toContain(originalText);

        const statusLabels = ['[OK]', '[READY]', '[DONE]', '[PASS]'];
        const hasStatus = statusLabels.some((s) => label1.textContent.includes(s));
        expect(hasStatus).toBe(true);

        vi.advanceTimersByTime(800);
        expect(label1.textContent).toBe(originalText);

        Math.random.mockRestore();
    });

    it('handles empty sectionLabels gracefully', () => {
        const { crtNoise } = createVisualEffectsDOM();

        expect(() => initVisualEffects([])).not.toThrow();

        vi.advanceTimersByTime(10000);
        expect(crtNoise).toBeDefined();
    });

    it('handles missing #crtNoise gracefully', () => {
        document.body.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'retro-card';
        document.body.appendChild(card);

        expect(() => initVisualEffects([])).not.toThrow();

        vi.advanceTimersByTime(10000);

        const scanline = card.querySelector('.card-scanline');
        expect(scanline).toBeDefined();
    });

    it('adds scanlines to multiple retro cards independently', () => {
        document.body.innerHTML = '';

        const cards = [];
        for (let i = 0; i < 5; i++) {
            const card = document.createElement('div');
            card.className = 'retro-card';
            document.body.appendChild(card);
            cards.push(card);
        }

        initVisualEffects([]);

        cards.forEach((card) => {
            const scanlines = card.querySelectorAll('.card-scanline');
            expect(scanlines.length).toBe(1);
            expect(scanlines[0].getAttribute('aria-hidden')).toBe('true');
        });
    });

    it('does not add scanlines when no retro cards exist', () => {
        document.body.innerHTML = '';
        expect(() => initVisualEffects([])).not.toThrow();
    });

    it('CRT noise removes and re-adds crt-noise--active class', () => {
        const { crtNoise } = createVisualEffectsDOM();

        vi.spyOn(Math, 'random').mockReturnValue(0);

        initVisualEffects([]);

        vi.advanceTimersByTime(3000);
        expect(crtNoise.classList.contains('crt-noise--active')).toBe(true);

        vi.advanceTimersByTime(250);
        expect(crtNoise.classList.contains('crt-noise--active')).toBe(false);

        Math.random.mockRestore();
    });

    it('label rotation skips when document is hidden', () => {
        const { label1 } = createVisualEffectsDOM();
        const originalText = label1.textContent;

        vi.spyOn(Math, 'random').mockReturnValue(0);
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });

        initVisualEffects([label1]);

        vi.advanceTimersByTime(4000);
        expect(label1.textContent).toBe(originalText);

        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        Math.random.mockRestore();
    });
});
