import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createNeofetch, createNeofetchElement } from '../../src/ee/neofetch.js';

function setupShell() {
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
    return shell;
}

describe('neofetch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns destroy function and done promise', () => {
        setupShell();
        const result = createNeofetch({ t: vi.fn(), reducedMotion: true });
        expect(result.destroy).toBeTypeOf('function');
        expect(result.done).toBeInstanceOf(Promise);
    });

    it('renders instantly with reducedMotion', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const output = document.querySelector('.neofetch-output');
        expect(output).not.toBeNull();
        expect(output.querySelector('.neofetch-grid')).not.toBeNull();
        expect(output.querySelector('.neofetch-ascii')).not.toBeNull();
        expect(output.querySelector('.neofetch-info')).not.toBeNull();
    });

    it('shows neofetch command line', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const cmdLine = document.querySelector('.ee-term-output__line--input');
        expect(cmdLine).not.toBeNull();
        expect(cmdLine.textContent).toBe('$ neofetch');
    });

    it('renders all info keys', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const keys = document.querySelectorAll('.neofetch-key');
        expect(keys.length).toBe(6);
        const keyTexts = [...keys].map((k) => k.textContent.replace(': ', '').trim());
        expect(keyTexts).toContain('OS');
        expect(keyTexts).toContain('Shell');
        expect(keyTexts).toContain('Uptime');
        expect(keyTexts).toContain('Stack');
        expect(keyTexts).toContain('Theme');
        expect(keyTexts).toContain('Status');
    });

    it('renders all info values', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const values = document.querySelectorAll('.neofetch-value');
        expect(values.length).toBe(6);
        const valueTexts = [...values].map((v) => v.textContent);
        expect(valueTexts).toContain('MILINSKY.OS v4.2.0');
        expect(valueTexts).toContain('milinsky.sh');
        expect(valueTexts).toContain('9+ years');
        expect(valueTexts).toContain('PHP / Java / AI');
    });

    it('detects dark theme', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const themeValue = [...document.querySelectorAll('.neofetch-value')].find(
            (v) => v.textContent === 'Solarized Dark'
        );
        expect(themeValue).toBeDefined();
    });

    it('detects light theme', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const themeValue = [...document.querySelectorAll('.neofetch-value')].find(
            (v) => v.textContent === 'Solarized Light'
        );
        expect(themeValue).toBeDefined();
    });

    it('types command character by character', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: false });
        vi.advanceTimersByTime(500);
        const cmdLine = document.querySelector('.ee-term-output__line--input');
        expect(cmdLine.textContent.length).toBeGreaterThan(0);
        vi.advanceTimersByTime(40 * '$ neofetch'.length);
        expect(cmdLine.textContent).toBe('$ neofetch');
    });

    it('fills ASCII art after command', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: false });
        vi.advanceTimersByTime(500 + 40 * '$ neofetch'.length + 300);
        const ascii = document.querySelector('.neofetch-ascii');
        expect(ascii).not.toBeNull();
        vi.advanceTimersByTime(80 * 5);
        expect(ascii.textContent).toContain('▄██  ██▄');
    });

    it('shows info lines after ASCII', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: false });
        vi.advanceTimersByTime(5000);
        const infoLines = document.querySelectorAll('.neofetch-key');
        expect(infoLines.length).toBe(6);
    });

    it('resolves done promise after all lines', async () => {
        setupShell();
        const result = createNeofetch({ t: vi.fn(), reducedMotion: false });
        let resolved = false;
        result.done.then(() => { resolved = true; });
        vi.advanceTimersByTime(10000);
        await Promise.resolve();
        expect(resolved).toBe(true);
    });

    it('resolves done immediately with reducedMotion', async () => {
        setupShell();
        const result = createNeofetch({ t: vi.fn(), reducedMotion: true });
        let resolved = false;
        result.done.then(() => { resolved = true; });
        await Promise.resolve();
        expect(resolved).toBe(true);
    });

    it('returns early without shell', () => {
        const result = createNeofetch({ t: vi.fn(), reducedMotion: true });
        expect(result.destroy).toBeTypeOf('function');
        expect(document.querySelector('.neofetch-output')).toBeNull();
    });

    it('destroy stops further rendering', () => {
        setupShell();
        const result = createNeofetch({ t: vi.fn(), reducedMotion: false });
        vi.advanceTimersByTime(500);
        result.destroy();
        vi.advanceTimersByTime(10000);
        const keys = document.querySelectorAll('.neofetch-key');
        expect(keys.length).toBe(0);
    });

    it('shows header Terminal Cat', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const header = document.querySelector('.neofetch-header');
        expect(header).not.toBeNull();
        expect(header.textContent).toBe('Terminal Cat');
    });

    it('shows status with dot indicator', () => {
        setupShell();
        createNeofetch({ t: vi.fn(), reducedMotion: true });
        const statusLine = [...document.querySelectorAll('.neofetch-key')].find(
            (k) => k.textContent.includes('Status')
        );
        expect(statusLine).toBeDefined();
        const value = statusLine.nextElementSibling;
        expect(value.textContent).toContain('● Available');
    });
});

describe('createNeofetchElement', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.documentElement.removeAttribute('data-theme');
    });

    it('returns a DOM element', () => {
        const el = createNeofetchElement();
        expect(el).toBeInstanceOf(HTMLElement);
    });

    it('returns element with neofetch-grid class', () => {
        const el = createNeofetchElement();
        expect(el.classList.contains('neofetch-grid')).toBe(true);
    });

    it('contains ASCII art section', () => {
        const el = createNeofetchElement();
        expect(el.querySelector('.neofetch-ascii')).not.toBeNull();
    });

    it('contains info section', () => {
        const el = createNeofetchElement();
        expect(el.querySelector('.neofetch-info')).not.toBeNull();
    });

    it('contains header', () => {
        const el = createNeofetchElement();
        const header = el.querySelector('.neofetch-header');
        expect(header).not.toBeNull();
        expect(header.textContent).toContain('Terminal Cat');
    });

    it('contains divider', () => {
        const el = createNeofetchElement();
        expect(el.querySelector('.neofetch-divider')).not.toBeNull();
    });

    it('contains all info keys', () => {
        const el = createNeofetchElement();
        const keys = el.querySelectorAll('.neofetch-key');
        expect(keys.length).toBe(6);
        const keyTexts = [...keys].map((k) => k.textContent.replace(': ', '').trim());
        expect(keyTexts).toContain('OS');
        expect(keyTexts).toContain('Shell');
        expect(keyTexts).toContain('Uptime');
        expect(keyTexts).toContain('Stack');
        expect(keyTexts).toContain('Theme');
        expect(keyTexts).toContain('Status');
    });

    it('contains theme value', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        const el = createNeofetchElement();
        const values = el.querySelectorAll('.neofetch-value');
        const themeValue = [...values].find((v) => v.textContent.includes('Solarized'));
        expect(themeValue).toBeDefined();
    });
});
