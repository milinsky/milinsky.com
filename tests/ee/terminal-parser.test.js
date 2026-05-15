import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTerminalParser } from '../../src/ee/terminal-parser.js';
import { getDailyPassword, formatSessionId } from '../../src/ee/terminal-parser/utils.js';
import { createCommands } from '../../src/ee/terminal-parser/commands.js';

function makeCtx() {
    return {
        eeManager: { discover: vi.fn(), getSessionSeed: () => 0.42 },
        t: vi.fn((key) => {
            const map = {
                ee_term_sudo: 'Nice try. Root access requires solving a riddle.',
                ee_term_exit: 'Are you sure? [Y/N]',
                ee_term_exit_confirm: 'Nice try. There is no exit from MILINSKY.OS.',
                ee_term_coffee: 'Status: caffeine depleted.',
                ee_term_secret_prompt: 'Enter daily password:',
                ee_term_secret_wrong: 'Access denied. Wrong password.',
                ee_term_secret_correct: 'Access granted. You know the secret.',
                ee_term_hello: "Hi! I'm not a chatbot. But I appreciate the attempt.",
                ee_term_rmrf: 'Nice try. This is not that terminal.',
                ee_term_pineapple: 'Pineapple on pizza: the hill I\'m willing to code on.',
                ee_term_unknown: 'Command not found: {cmd}. Type "help" for available commands.',
            };
            return map[key] ?? key;
        }),
        reducedMotion: false,
    };
}

function setupTerminal() {
    const frame = document.createElement('div');
    frame.className = 'hero__terminal-frame';
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
    right.appendChild(shell);
    split.appendChild(left);
    split.appendChild(divider);
    split.appendChild(right);
    frame.appendChild(split);
    document.body.appendChild(frame);
    return frame;
}

function clickTerminal(frame) {
    frame.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function pressKey(key) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    document.dispatchEvent(event);
}

function typeText(text) {
    for (const ch of text) {
        pressKey(ch);
    }
}

function pressEnter() {
    pressKey('Enter');
}

function getOutputLines(frame) {
    return [...frame.querySelectorAll('.ee-term-output__line')].map((el) => el.textContent);
}

describe('terminal-parser', () => {
    let ctx;
    let destroyFn;

    beforeEach(() => {
        document.body.innerHTML = '';
        ctx = makeCtx();
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        vi.restoreAllMocks();
    });

    function init() {
        const result = createTerminalParser(ctx);
        destroyFn = result.destroy;
        return result;
    }

    it('returns early if no terminal element found', () => {
        const result = createTerminalParser(ctx);
        expect(result).toBeDefined();
        expect(result.destroy).toBeTypeOf('function');
        expect(() => result.destroy()).not.toThrow();
    });

    it('returns destroy function', () => {
        const frame = setupTerminal();
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('creates output container and input line', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        expect(frame.querySelector('.ee-term-output')).not.toBeNull();
        expect(frame.querySelector('.ee-term-input')).not.toBeNull();
        expect(frame.querySelector('.ee-term-cursor')).not.toBeNull();
    });

    it('clicking terminal activates it', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        clickTerminal(frame);
        expect(frame.classList.contains('ee-term-active')).toBe(true);
    });

    it('does not activate without click', () => {
        const frame = setupTerminal();
        init();
        expect(frame.classList.contains('ee-term-active')).toBe(false);
    });

    it('discover ee09 called on first command execution', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        clickTerminal(frame);
        typeText('hello');
        pressEnter();
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee09');
        expect(ctx.eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('does not call discover twice on second command', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        clickTerminal(frame);
        typeText('hello');
        pressEnter();
        typeText('hello');
        pressEnter();
        expect(ctx.eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('help command shows command list with secret strikethrough', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('help');
        pressEnter();
        const lines = getOutputLines(frame);
        const helpLine = lines.find((l) => l.includes('Available commands'));
        expect(helpLine).toBeDefined();
        const secretLine = lines.find((l) => l.includes('~~secret~~'));
        expect(secretLine).toBeDefined();
    });

    it('sudo command shows root access message', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('sudo');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Root access'))).toBe(true);
    });

    it('sudo make me a sandwich shows ASCII sandwich', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('sudo make me a sandwich');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Ok.'))).toBe(true);
        expect(lines.some((l) => l.includes('HAM') || l.includes('BREAD'))).toBe(true);
    });

    it('exit command dims screen with confirmation', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('exit');
        pressEnter();
        expect(frame.classList.contains('ee-term-dimmed')).toBe(true);
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('[Y/N]'))).toBe(true);
    });

    it('exit Y shows no escape message', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('exit');
        pressEnter();
        typeText('Y');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('no exit'))).toBe(true);
    });

    it('exit N shows aborted', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('exit');
        pressEnter();
        typeText('N');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Aborted'))).toBe(true);
    });

    it('whoami shows visitor with session id', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('whoami');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('visitor_'))).toBe(true);
    });

    it('ls shows file listing', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('ls');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('projects/') && l.includes('coffee.md'))).toBe(true);
    });

    it('cat coffee.md shows ASCII cup and caffeine message', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('cat coffee.md');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('caffeine depleted'))).toBe(true);
    });

    it('cat secrets.enc shows partial password hint', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('cat secrets.enc');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('encrypted'))).toBe(true);
        expect(lines.some((l) => l.includes('**'))).toBe(true);
    });

    it('hello shows chatbot response', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('hello');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('chatbot'))).toBe(true);
    });

    it('rm -rf / shows denial message', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('rm -rf /');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('not that terminal'))).toBe(true);
    });

    it('pineapple shows pizza opinion', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('pineapple');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Pineapple on pizza'))).toBe(true);
    });

    it('secret command asks for password', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('secret');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Enter daily password'))).toBe(true);
    });

    it('secret wrong password shows access denied', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('secret');
        pressEnter();
        typeText('wrongpass');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Access denied'))).toBe(true);
    });

    it('secret correct password shows access granted', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('secret');
        pressEnter();
        const password = getDailyPassword();
        typeText(password);
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('Access granted'))).toBe(true);
    });

    it('unknown command shows error with command name', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('foobar');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('foobar') && l.includes('Command not found'))).toBe(true);
    });

    it('backspace removes last character from input', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('ab');
        pressKey('Backspace');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.some((l) => l.includes('$ a'))).toBe(true);
    });

    it('escape deactivates terminal', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        pressKey('Escape');
        expect(frame.classList.contains('ee-term-active')).toBe(false);
    });

    it('character input appends to buffer', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('abc');
        const inputLine = frame.querySelector('.ee-term-input');
        expect(inputLine.textContent).toContain('abc');
    });

    it('destroy removes all listeners and stops responding', () => {
        const frame = document.createElement('div');
        frame.className = 'hero__terminal-frame';
        document.body.appendChild(frame);
        const { destroy } = init();
        destroy();
        clickTerminal(frame);
        expect(frame.classList.contains('ee-term-active')).toBe(false);
    });

    it('input lines have distinct css class', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('hello');
        pressEnter();
        const inputLines = frame.querySelectorAll('.ee-term-output__line--input');
        expect(inputLines.length).toBeGreaterThanOrEqual(1);
        expect(inputLines[0].textContent).toContain('$ hello');
    });

    it('neofetch command renders grid element', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('neofetch');
        pressEnter();
        const outputLines = frame.querySelectorAll('.ee-term-output__line');
        const elementLine = [...outputLines].find((el) => el.querySelector('.neofetch-grid'));
        expect(elementLine).not.toBeNull();
        expect(elementLine.querySelector('.neofetch-grid')).not.toBeNull();
        expect(elementLine.querySelector('.neofetch-ascii')).not.toBeNull();
        expect(elementLine.querySelector('.neofetch-info')).not.toBeNull();
    });

    it('neofetch command triggers discover', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('neofetch');
        pressEnter();
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee09');
    });

    it('processResult handles element output', () => {
        const frame = setupTerminal();
        init();
        clickTerminal(frame);
        typeText('neofetch');
        pressEnter();
        const elementWrappers = frame.querySelectorAll('.ee-term-output__line');
        const wrapperWithGrid = [...elementWrappers].find((el) => el.querySelector('.neofetch-grid'));
        expect(wrapperWithGrid).not.toBeNull();
        expect(wrapperWithGrid.querySelector('.neofetch-grid').textContent).toContain('MILINSKY.OS');
    });

    it('key events ignored when terminal not active', () => {
        const frame = document.createElement('div');
        frame.className = 'hero__terminal-frame';
        document.body.appendChild(frame);
        init();
        typeText('hello');
        pressEnter();
        const lines = getOutputLines(frame);
        expect(lines.length).toBe(0);
    });
});

describe('terminal-parser/utils', () => {
    it('getDailyPassword returns non-empty string', () => {
        const pw = getDailyPassword();
        expect(pw).toBeTypeOf('string');
        expect(pw.length).toBeGreaterThan(0);
    });

    it('getDailyPassword is deterministic for same day', () => {
        const pw1 = getDailyPassword();
        const pw2 = getDailyPassword();
        expect(pw1).toBe(pw2);
    });

    it('formatSessionId returns zero-padded string', () => {
        const id = formatSessionId(0.42);
        expect(id).toBe('420000');
    });
});

describe('terminal-parser/commands', () => {
    const mockT = (key) => key;
    const seed = 0.5;

    it('execute returns object with text property', () => {
        const cmds = createCommands({ t: mockT, sessionSeed: seed });
        const result = cmds.execute('hello');
        expect(result).toHaveProperty('text');
    });

    it('cat without args shows usage', () => {
        const cmds = createCommands({ t: mockT, sessionSeed: seed });
        const result = cmds.execute('cat');
        expect(result.text).toContain('Usage');
    });

    it('cat unknown file shows error', () => {
        const cmds = createCommands({ t: mockT, sessionSeed: seed });
        const result = cmds.execute('cat nosuch.txt');
        expect(result.text).toContain('No such file');
    });

    it('ls does not set discover', () => {
        const cmds = createCommands({ t: mockT, sessionSeed: seed });
        const result = cmds.execute('ls');
        expect(result.discover).toBe(true);
    });
});
