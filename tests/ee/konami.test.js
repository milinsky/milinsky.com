import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createKonami } from '../../src/ee/konami.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
const BIOS_MAP = {
    ee_konami_bios_1: 'BIOS v4.2.0\nMemory Test... 64MB OK\nLoading OS...\nKernel panic\n...just kidding.',
    ee_konami_bios_2: 'BIOS v4.2.0\nMemory Test... 128MB OK\nBooting OS...\nFATAL: coffee.dll not found\n...relax.',
    ee_konami_bios_3: 'BIOS v4.2.0\nMemory Test... 256MB OK\nStarting OS...\nERROR: /dev/caffeine exhausted\n...need coffee.',
};

function makeCtx(overrides = {}) {
    return { eeManager: { discover: vi.fn() }, t: vi.fn((key) => BIOS_MAP[key] ?? key), reducedMotion: false, ...overrides };
}

function fire(code) {
    document.dispatchEvent(new KeyboardEvent('keydown', { code }));
}

function fireSequence(codes) {
    for (const code of codes) fire(code);
}

describe('konami', () => {
    let ctx, destroyFn;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        document.documentElement.classList.remove('ee-crt-glitch');
        ctx = makeCtx();
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        document.documentElement.classList.remove('ee-crt-glitch');
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function init(overrides = {}) {
        const result = createKonami({ ...ctx, ...overrides });
        destroyFn = result.destroy;
        return result;
    }

    function triggerAndWait() {
        fireSequence(KONAMI);
        vi.advanceTimersByTime(1000);
    }

    it('full Konami sequence triggers BIOS overlay', () => {
        init();
        triggerAndWait();
        expect(document.querySelector('.ee-bios-overlay')).not.toBeNull();
    });

    it('partial sequence does not trigger BIOS', () => {
        init();
        fireSequence(KONAMI.slice(0, 5));
        vi.advanceTimersByTime(1000);
        expect(document.querySelector('.ee-bios-overlay')).toBeNull();
    });

    it('wrong key resets progress', () => {
        init();
        fireSequence(KONAMI.slice(0, 4));
        fire('KeyZ');
        triggerAndWait();
        expect(document.querySelector('.ee-bios-overlay')).not.toBeNull();
    });

    it('pressing ArrowUp mid-sequence restarts from position 1', () => {
        init();
        const seq = ['ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        fireSequence(seq);
        vi.advanceTimersByTime(1000);
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee01');
    });

    it('wrong key then partial sequence does not trigger', () => {
        init();
        fire('ArrowDown');
        fire('ArrowUp');
        fire('ArrowUp');
        expect(ctx.eeManager.discover).not.toHaveBeenCalled();
    });

    it('discover ee01 is called once on repeated triggers', () => {
        init();
        triggerAndWait();
        triggerAndWait();
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee01');
        expect(ctx.eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('daily seed selects different message variants', () => {
        const spy = vi.spyOn(Date.prototype, 'getDate');
        const results = new Set();
        for (let day = 1; day <= 3; day++) {
            spy.mockReturnValue(day);
            document.body.innerHTML = '';
            const c = makeCtx();
            const { destroy } = createKonami(c);
            fireSequence(KONAMI);
            vi.advanceTimersByTime(1000);
            const calls = c.t.mock.calls;
            results.add(calls[calls.length - 1][0]);
            destroy();
        }
        expect(results.size).toBeGreaterThanOrEqual(2);
    });

    it('reducedMotion skips CRT glitch and shows BIOS immediately', () => {
        init({ reducedMotion: true });
        fireSequence(KONAMI);
        vi.advanceTimersByTime(0);
        const textEl = document.querySelector('.ee-bios-overlay__text');
        expect(textEl).not.toBeNull();
        expect(textEl.textContent).toContain('BIOS');
        expect(document.documentElement.classList.contains('ee-crt-glitch')).toBe(false);
    });

    it('CRT glitch class is added then removed', () => {
        init();
        fireSequence(KONAMI);
        expect(document.documentElement.classList.contains('ee-crt-glitch')).toBe(true);
        vi.advanceTimersByTime(1000);
        expect(document.documentElement.classList.contains('ee-crt-glitch')).toBe(false);
    });

    it('close on Escape removes overlay', () => {
        init();
        triggerAndWait();
        fire('Escape');
        expect(document.querySelector('.ee-bios-overlay')).toBeNull();
    });

    it('close on click removes overlay', () => {
        init();
        triggerAndWait();
        document.querySelector('.ee-bios-overlay').click();
        expect(document.querySelector('.ee-bios-overlay')).toBeNull();
    });

    it('Escape without overlay is a no-op', () => {
        init();
        fire('Escape');
        expect(ctx.eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy removes listeners and prevents trigger', () => {
        const { destroy } = init();
        destroy();
        triggerAndWait();
        expect(ctx.eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy stops pending CRT timer', () => {
        const localCtx = makeCtx();
        const { destroy } = createKonami(localCtx);
        fireSequence(KONAMI);
        destroy();
        vi.advanceTimersByTime(5000);
        expect(document.querySelector('.ee-bios-overlay')).toBeNull();
    });

    it('returns destroy function that does not throw', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('typewriter effect completes all text', () => {
        init();
        triggerAndWait();
        vi.advanceTimersByTime(10000);
        const textEl = document.querySelector('.ee-bios-overlay__text');
        const endings = ['just kidding', 'relax', 'need coffee'];
        const hasEnding = endings.some((e) => textEl.textContent.includes(e));
        expect(hasEnding).toBe(true);
    });
});
