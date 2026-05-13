import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initLogoMorph } from '../../src/ee/logo-morph.js';

function makeOptions(overrides = {}) {
    return {
        logoPre: overrides.logoPre ?? document.querySelector('.nav__logo-ascii'),
        originalLogo: overrides.originalLogo ?? '###\n###',
        reducedMotion: overrides.reducedMotion ?? false,
        showToast: overrides.showToast ?? vi.fn(),
        t: overrides.t ?? vi.fn((key) => key),
    };
}

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
        const opts = makeOptions({ logoPre: null });
        expect(() => initLogoMorph(eeManager, opts)).not.toThrow();
    });

    it('returns early if logoPre is null', () => {
        document.body.innerHTML = '<a class="nav__logo"></a>';
        const opts = makeOptions({ logoPre: null });
        expect(() => initLogoMorph(eeManager, opts)).not.toThrow();
    });

    it('7 clicks within 3.5s triggers morph and discovers ee03', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 400);
        expect(eeManager.discover).toHaveBeenCalledWith('ee03');
    });

    it('slow clicks do NOT trigger morph', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 600);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('6 clicks do NOT trigger morph', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(6, 400);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('creates matrix overlay on morph trigger', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 400);
        expect(document.querySelector('.ee-matrix-overlay')).not.toBeNull();
    });

    it('matrix overlay contains column elements', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 400);
        const overlay = document.querySelector('.ee-matrix-overlay');
        const cols = overlay.querySelectorAll('.ee-matrix-col');
        expect(cols.length).toBeGreaterThan(0);
    });

    it('removes overlay after 2000ms and changes logo text', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 400);
        vi.advanceTimersByTime(2000);
        expect(document.querySelector('.ee-matrix-overlay')).toBeNull();
        expect(eeLogoPre.textContent).not.toBe(eeOriginalLogo);
    });

    it('reverts logo text after 3000 more ms', () => {
        initLogoMorph(eeManager, makeOptions());
        clickLogo(7, 400);
        vi.advanceTimersByTime(2000 + 3000);
        expect(eeLogoPre.textContent).toBe(eeOriginalLogo);
    });

    it('shows toast with reduced motion', () => {
        const showToast = vi.fn();
        initLogoMorph(eeManager, makeOptions({ reducedMotion: true, showToast }));
        clickLogo(7, 400);
        expect(showToast).toHaveBeenCalledWith('ee_logo_reduced', 3000);
    });

    it('with reduced motion, changes logo text directly', () => {
        initLogoMorph(eeManager, makeOptions({ reducedMotion: true }));
        clickLogo(7, 400);
        expect(eeLogoPre.textContent).not.toBe(eeOriginalLogo);
    });

    it('with reduced motion, reverts after 3000ms', () => {
        initLogoMorph(eeManager, makeOptions({ reducedMotion: true }));
        clickLogo(7, 400);
        vi.advanceTimersByTime(3000);
        expect(eeLogoPre.textContent).toBe(eeOriginalLogo);
    });

    it('does not trigger morph again while active', () => {
        initLogoMorph(eeManager, makeOptions({ reducedMotion: true }));
        clickLogo(7, 400);
        eeManager.discover.mockClear();
        const logoLink = document.querySelector('.nav__logo');
        logoLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('uses session seed for art selection', () => {
        eeManager.getSessionSeed.mockReturnValue(0.0);
        initLogoMorph(eeManager, makeOptions({ reducedMotion: true }));
        clickLogo(7, 400);
        const firstArt = eeLogoPre.textContent;
        expect(firstArt).not.toBe(eeOriginalLogo);
    });

    it('shifts clicks when more than 7 slow clicks accumulate', () => {
        initLogoMorph(eeManager, makeOptions());
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
});
