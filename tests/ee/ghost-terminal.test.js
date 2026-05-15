import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGhostTerminal } from '../../src/ee/ghost-terminal.js';

describe('ghost-terminal', () => {
    let eeManager;
    let t;
    let showToast;
    let destroyFn;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';

        const terminal = document.createElement('div');
        terminal.className = 'hero__terminal-frame';
        const split = document.createElement('div');
        split.className = 'hero__split';
        const left = document.createElement('div');
        left.className = 'hero__split-left';
        const divider = document.createElement('div');
        divider.className = 'hero__split-divider';
        const right = document.createElement('div');
        right.className = 'hero__split-right';
        const shell = document.createElement('div');
        shell.className = 'hero__terminal-shell';
        const output = document.createElement('div');
        output.className = 'ee-term-output';
        const inputLine = document.createElement('div');
        inputLine.className = 'ee-term-input';
        shell.appendChild(output);
        shell.appendChild(inputLine);
        right.appendChild(shell);
        split.appendChild(left);
        split.appendChild(divider);
        split.appendChild(right);
        terminal.appendChild(split);
        document.body.appendChild(terminal);

        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn().mockReturnValue(0.3),
        };
        t = vi.fn((key) => key);
        showToast = vi.fn();
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function init(overrides = {}) {
        const ctx = { eeManager, t, showToast, reducedMotion: false, ...overrides };
        const result = createGhostTerminal(ctx);
        destroyFn = result.destroy;
        return result;
    }

    function getOutput() {
        return document.querySelector('.ee-term-output');
    }

    function getInputLine() {
        return document.querySelector('.ee-term-input');
    }

    it('returns destroy function', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('ghost appears after inactivity period', () => {
        init();
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledWith('ee02');
        vi.advanceTimersByTime(500);
        const lines = getOutput().querySelectorAll('.ee-ghost-prompt-line');
        expect(lines.length).toBeGreaterThanOrEqual(1);
    });

    it('hides input line while ghost is active', () => {
        init();
        vi.advanceTimersByTime(40000);
        expect(getInputLine().style.display).toBe('none');
    });

    it('restores input line after ghost finishes', () => {
        init();
        vi.advanceTimersByTime(40000);
        expect(getInputLine().style.display).toBe('none');
        vi.advanceTimersByTime(9000);
        expect(getInputLine().style.display).toBe('');
    });

    it('activity resets inactivity timer', () => {
        init();
        vi.advanceTimersByTime(39999);
        document.dispatchEvent(new Event('mousemove'));
        vi.advanceTimersByTime(1);
        expect(eeManager.discover).not.toHaveBeenCalled();
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledWith('ee02');
    });

    it('ghost types commands character by character', () => {
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(500);
        const promptLine = getOutput().querySelector('.ee-ghost-prompt-line');
        expect(promptLine).not.toBeNull();
        expect(promptLine.textContent).toBe('$ ');
        vi.advanceTimersByTime(80);
        expect(promptLine.textContent.length).toBe(3);
        vi.advanceTimersByTime(80 * 7);
        expect(promptLine.textContent).toBe('$ ls /etc/');
    });

    it('ghost shows command output after typing', () => {
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(500);
        const cmdLength = 'ls /etc/'.length;
        vi.advanceTimersByTime(80 * cmdLength + 400);
        const outputLines = getOutput().querySelectorAll('.ee-ghost-output-line');
        expect(outputLines.length).toBe(1);
        expect(outputLines[0].textContent).toBe('passwd  shadow  hosts  secrets.txt');
    });

    it('ghost lines fade out after timeout', () => {
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(500);
        const lines = getOutput().querySelectorAll('.ee-ghost-prompt-line');
        expect(lines.length).toBeGreaterThanOrEqual(1);
        vi.advanceTimersByTime(8000);
        const faded = getOutput().querySelectorAll('.ee-term-output__line--fade');
        expect(faded.length).toBeGreaterThanOrEqual(1);
    });

    it('discover ee02 is called once on first activation', () => {
        init();
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledWith('ee02');
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('does not double discover on subsequent inactivity', () => {
        init();
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(120000);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('reducedMotion shows toast instead of animation', () => {
        init({ reducedMotion: true });
        vi.advanceTimersByTime(40000);
        expect(showToast).toHaveBeenCalledWith('ee_ghost_toast');
        const lines = getOutput().querySelectorAll('.ee-ghost-prompt-line');
        expect(lines.length).toBe(0);
    });

    it('destroy clears all timers and prevents activation', () => {
        const { destroy } = init();
        destroy();
        destroyFn = null;
        vi.advanceTimersByTime(120000);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles missing terminal elements gracefully', () => {
        document.body.innerHTML = '';
        init();
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledWith('ee02');
    });

    it('picks script based on session seed', () => {
        eeManager.getSessionSeed = vi.fn().mockReturnValue(0.7);
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(500);
        const promptLine = getOutput().querySelector('.ee-ghost-prompt-line');
        vi.advanceTimersByTime(80 * 14 + 400);
        expect(promptLine.textContent).toBe('$ ls ~/projects/');
    });

    it('scroll event resets inactivity timer', () => {
        init();
        vi.advanceTimersByTime(39999);
        document.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(2);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('keydown event resets inactivity timer', () => {
        init();
        vi.advanceTimersByTime(39999);
        document.dispatchEvent(new Event('keydown'));
        vi.advanceTimersByTime(2);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('touchstart event resets inactivity timer', () => {
        init();
        vi.advanceTimersByTime(39999);
        document.dispatchEvent(new Event('touchstart'));
        vi.advanceTimersByTime(2);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('reducedMotion works without showToast', () => {
        init({ reducedMotion: true, showToast: undefined });
        vi.advanceTimersByTime(40000);
        expect(eeManager.discover).toHaveBeenCalledWith('ee02');
    });

    it('ghost completes second command step', () => {
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(5000);
        const outputLines = getOutput().querySelectorAll('.ee-ghost-output-line');
        expect(outputLines.length).toBe(2);
        expect(outputLines[1].textContent).toBe("hmm, should I... or shouldn't I?");
    });

    it('destroy during typing stops further characters', () => {
        init();
        vi.advanceTimersByTime(40000);
        vi.advanceTimersByTime(500 + 80);
        const promptLine = getOutput().querySelector('.ee-ghost-prompt-line');
        const lengthBefore = promptLine.textContent.length;
        expect(lengthBefore).toBeGreaterThan(2);
        destroyFn();
        destroyFn = null;
        vi.advanceTimersByTime(5000);
        expect(promptLine.textContent.length).toBe(lengthBefore);
    });
});
