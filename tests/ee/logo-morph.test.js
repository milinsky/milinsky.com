import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogoMorph } from '../../src/ee/logo-morph.js';

describe('logo-morph', () => {
    let eeManager;
    let eeLogoPre;
    let eeOriginalLogo;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';

        const logoLink = document.createElement('a');
        logoLink.className = 'nav__logo';
        logoLink.href = '#';
        eeLogoPre = document.createElement('pre');
        eeLogoPre.className = 'nav__logo-ascii';
        eeLogoPre.textContent = '###\n###';
        logoLink.appendChild(eeLogoPre);
        document.body.appendChild(logoLink);

        eeOriginalLogo = '###\n###';

        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn(() => 0.5),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function clickLogo(times, intervalMs) {
        const logoLink = document.querySelector('.nav__logo');
        for (let i = 0; i < times; i++) {
            logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            vi.advanceTimersByTime(intervalMs);
        }
    }

    it('returns early if no .nav__logo element', () => {
        document.body.innerHTML = '';
        expect(() => createLogoMorph({ eeManager, t: vi.fn((k) => k) })).not.toThrow();
    });

    it('returns early if no .nav__logo-ascii element', () => {
        document.body.innerHTML = '<a class="nav__logo"></a>';
        expect(() => createLogoMorph({ eeManager, t: vi.fn((k) => k) })).not.toThrow();
    });

    it('7 fast clicks with gap < 500ms triggers morph and discovers ee03', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 400);
        expect(eeManager.discover).toHaveBeenCalledWith('ee03');
    });

    it('7 slow clicks with gap >= 500ms do NOT trigger morph', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 600);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('6 fast + 1 slow click (gap >= 500ms) do NOT trigger morph', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        const logoLink = document.querySelector('.nav__logo');
        for (let i = 0; i < 6; i++) {
            logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            vi.advanceTimersByTime(400);
        }
        vi.advanceTimersByTime(600);
        logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('7 clicks with exactly 499ms gap triggers morph', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 499);
        expect(eeManager.discover).toHaveBeenCalledWith('ee03');
    });

    it('6 clicks do NOT trigger morph', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(6, 400);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('creates matrix overlay on morph trigger', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 400);
        expect(document.querySelector('.ee-matrix-overlay')).not.toBeNull();
    });

    it('matrix overlay contains column elements', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 400);
        const overlay = document.querySelector('.ee-matrix-overlay');
        const cols = overlay.querySelectorAll('.ee-matrix-col');
        expect(cols.length).toBeGreaterThan(0);
    });

    it('removes overlay after 2000ms and changes logo text', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 400);
        vi.advanceTimersByTime(2000);
        expect(document.querySelector('.ee-matrix-overlay')).toBeNull();
        expect(eeLogoPre.textContent).not.toBe(eeOriginalLogo);
    });

    it('reverts logo text after 3000 more ms', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        clickLogo(7, 400);
        vi.advanceTimersByTime(2000 + 3000);
        expect(eeLogoPre.textContent).toBe(eeOriginalLogo);
    });

    it('shows toast with reduced motion', () => {
        const showToast = vi.fn();
        createLogoMorph({ eeManager, t: vi.fn((k) => k), showToast, reducedMotion: true });
        clickLogo(7, 400);
        expect(showToast).toHaveBeenCalledWith('ee_logo_reduced', 3000);
    });

    it('with reduced motion, changes logo text directly', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        expect(eeLogoPre.textContent).not.toBe(eeOriginalLogo);
    });

    it('with reduced motion, reverts after 3000ms', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        vi.advanceTimersByTime(3000);
        expect(eeLogoPre.textContent).toBe(eeOriginalLogo);
    });

    it('does not trigger morph again while active', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        eeManager.discover.mockClear();
        const logoLink = document.querySelector('.nav__logo');
        logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('uses session seed for art selection', () => {
        eeManager.getSessionSeed.mockReturnValue(0.0);
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        const firstArt = eeLogoPre.textContent;
        expect(firstArt).not.toBe(eeOriginalLogo);
    });

    it('altArts has exactly 5 elements (verified via session seed indices)', () => {
        const arts = [];
        for (let seed = 0; seed < 5; seed++) {
            eeManager.getSessionSeed.mockReturnValue(seed / 5);
            document.querySelector('.nav__logo-ascii').textContent = eeOriginalLogo;
            const { destroy } = createLogoMorph({
                eeManager,
                t: vi.fn((k) => k),
                reducedMotion: true,
                showToast: vi.fn(),
            });
            clickLogo(7, 400);
            arts.push(eeLogoPre.textContent);
            destroy();
        }
        const unique = [...new Set(arts)];
        expect(unique.length).toBe(5);
    });

    it.each([
        [0.0, '/\\'],
        [0.2, 'o.o'],
        [0.4, 'PHP'],
        [0.6, 'Duyler'],
        [0.8, '+'],
    ])('seed %s produces art containing %s', (seed, marker) => {
        eeManager.getSessionSeed.mockReturnValue(seed);
        document.querySelector('.nav__logo-ascii').textContent = eeOriginalLogo;
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        expect(eeLogoPre.textContent).toContain(marker);
    });

    it('shifts clicks when more than 7 slow clicks accumulate', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        const logoLink = document.querySelector('.nav__logo');
        for (let i = 0; i < 8; i++) {
            logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            vi.advanceTimersByTime(600);
        }
        expect(eeManager.discover).not.toHaveBeenCalled();
        for (let i = 0; i < 7; i++) {
            logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            vi.advanceTimersByTime(400);
        }
        expect(eeManager.discover).toHaveBeenCalledWith('ee03');
    });

    it('returns destroy function that cleans up', () => {
        createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        const { destroy } = createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('destroy removes click listener', () => {
        const { destroy } = createLogoMorph({ eeManager, t: vi.fn((k) => k) });
        destroy();
        eeManager.discover.mockClear();
        clickLogo(7, 400);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy stops pending timers', () => {
        const { destroy } = createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        destroy();
        const textAfterDestroy = eeLogoPre.textContent;
        vi.advanceTimersByTime(10000);
        expect(eeLogoPre.textContent).toBe(textAfterDestroy);
    });

    it('art 3 (Duyler logo) contains duyler text case-insensitive', () => {
        eeManager.getSessionSeed.mockReturnValue(0.6);
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        expect(eeLogoPre.textContent.toLowerCase()).toContain('duyler');
    });

    it('art 4 (retro computer) contains both | and + characters', () => {
        eeManager.getSessionSeed.mockReturnValue(0.8);
        createLogoMorph({ eeManager, t: vi.fn((k) => k), reducedMotion: true, showToast: vi.fn() });
        clickLogo(7, 400);
        expect(eeLogoPre.textContent).toContain('|');
        expect(eeLogoPre.textContent).toContain('+');
    });

    it('all 5 altArts are non-empty strings', () => {
        for (let seed = 0; seed < 5; seed++) {
            eeManager.getSessionSeed.mockReturnValue(seed / 5);
            document.querySelector('.nav__logo-ascii').textContent = eeOriginalLogo;
            const { destroy } = createLogoMorph({
                eeManager,
                t: vi.fn((k) => k),
                reducedMotion: true,
                showToast: vi.fn(),
            });
            clickLogo(7, 400);
            expect(eeLogoPre.textContent).toBeTypeOf('string');
            expect(eeLogoPre.textContent.length).toBeGreaterThan(0);
            expect(eeLogoPre.textContent).not.toBe(eeOriginalLogo);
            destroy();
        }
    });
});
