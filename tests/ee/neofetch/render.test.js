import { describe, it, expect, beforeEach } from 'vitest';
import {
    ASCII_LINES,
    DIVIDER,
    getInfoLines,
    buildRightPanel,
    createNeofetchElement,
    renderInstant,
} from '../../../src/ee/neofetch/render.js';

describe('neofetch/render — ASCII_LINES', () => {
    it('is an array of strings', () => {
        expect(Array.isArray(ASCII_LINES)).toBe(true);
        for (const line of ASCII_LINES) {
            expect(line).toBeTypeOf('string');
        }
    });

    it('contains only non-empty strings', () => {
        for (const line of ASCII_LINES) {
            expect(line.length).toBeGreaterThan(0);
        }
    });

    it('has 9 lines of ASCII art', () => {
        expect(ASCII_LINES).toHaveLength(9);
    });

    it('contains unicode block characters', () => {
        const joined = ASCII_LINES.join('');
        expect(joined).toContain('▄');
        expect(joined).toContain('█');
    });
});

describe('neofetch/render — DIVIDER', () => {
    it('is a non-empty string', () => {
        expect(DIVIDER).toBeTypeOf('string');
        expect(DIVIDER.length).toBeGreaterThan(0);
    });

    it('consists of box-drawing characters', () => {
        for (const ch of DIVIDER) {
            expect('─').toContain(ch);
        }
    });
});

describe('neofetch/render — getInfoLines', () => {
    it('returns an array of info objects', () => {
        const lines = getInfoLines();
        expect(Array.isArray(lines)).toBe(true);
        expect(lines.length).toBeGreaterThan(0);
    });

    it('each info object has key and value strings', () => {
        const lines = getInfoLines();
        for (const info of lines) {
            expect(info).toHaveProperty('key');
            expect(info).toHaveProperty('value');
            expect(info.key).toBeTypeOf('string');
            expect(info.value).toBeTypeOf('string');
            expect(info.key.length).toBeGreaterThan(0);
        }
    });

    it('contains OS, Shell, Uptime, Stack, Theme, Status keys', () => {
        const lines = getInfoLines();
        const keys = lines.map((l) => l.key);
        expect(keys).toContain('OS');
        expect(keys).toContain('Shell');
        expect(keys).toContain('Uptime');
        expect(keys).toContain('Stack');
        expect(keys).toContain('Theme');
        expect(keys).toContain('Status');
        expect(keys).toHaveLength(6);
    });

    it('returns correct static values for OS, Shell, Uptime, Stack', () => {
        const lines = getInfoLines();
        const byKey = Object.fromEntries(lines.map((l) => [l.key, l.value]));
        expect(byKey['OS']).toBe('MILINSKY.OS v4.2.0');
        expect(byKey['Shell']).toBe('milinsky.sh');
        expect(byKey['Uptime']).toBe('9+ years');
        expect(byKey['Stack']).toBe('PHP / Java / AI');
    });

    it('returns Solarized Dark theme when data-theme is not light', () => {
        document.documentElement.removeAttribute('data-theme');
        const lines = getInfoLines();
        const theme = lines.find((l) => l.key === 'Theme');
        expect(theme.value).toBe('Solarized Dark');
    });

    it('returns Solarized Light theme when data-theme is light', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        const lines = getInfoLines();
        const theme = lines.find((l) => l.key === 'Theme');
        expect(theme.value).toBe('Solarized Light');
        document.documentElement.removeAttribute('data-theme');
    });

    it('Status value contains dot indicator', () => {
        const lines = getInfoLines();
        const status = lines.find((l) => l.key === 'Status');
        expect(status.value).toContain('●');
        expect(status.value).toContain('Available');
    });
});

describe('neofetch/render — buildRightPanel', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('returns a DOM element', () => {
        const panel = buildRightPanel();
        expect(panel).toBeInstanceOf(HTMLElement);
    });

    it('has neofetch-info class', () => {
        const panel = buildRightPanel();
        expect(panel.classList.contains('neofetch-info')).toBe(true);
    });

    it('contains header with Terminal Cat text', () => {
        const panel = buildRightPanel();
        const header = panel.querySelector('.neofetch-header');
        expect(header).not.toBeNull();
        expect(header.textContent).toBe('Terminal Cat');
    });

    it('contains divider element', () => {
        const panel = buildRightPanel();
        const divider = panel.querySelector('.neofetch-divider');
        expect(divider).not.toBeNull();
        expect(divider.textContent).toBe(DIVIDER);
    });

    it('contains 6 info rows with key and value spans', () => {
        const panel = buildRightPanel();
        const keys = panel.querySelectorAll('.neofetch-key');
        const values = panel.querySelectorAll('.neofetch-value');
        expect(keys).toHaveLength(6);
        expect(values).toHaveLength(6);
    });

    it('info rows have correct key:value structure', () => {
        const panel = buildRightPanel();
        const keys = panel.querySelectorAll('.neofetch-key');
        const keyTexts = [...keys].map((k) => k.textContent.replace(': ', '').trim());
        expect(keyTexts).toContain('OS');
        expect(keyTexts).toContain('Shell');
        expect(keyTexts).toContain('Status');
    });
});

describe('neofetch/render — createNeofetchElement', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('returns a DOM element', () => {
        const el = createNeofetchElement();
        expect(el).toBeInstanceOf(HTMLElement);
    });

    it('has neofetch-grid class', () => {
        const el = createNeofetchElement();
        expect(el.classList.contains('neofetch-grid')).toBe(true);
    });

    it('contains ASCII art pre element', () => {
        const el = createNeofetchElement();
        const pre = el.querySelector('.neofetch-ascii');
        expect(pre).not.toBeNull();
        expect(pre.tagName).toBe('PRE');
    });

    it('ASCII art content matches ASCII_LINES joined by newline', () => {
        const el = createNeofetchElement();
        const pre = el.querySelector('.neofetch-ascii');
        expect(pre.textContent).toBe(ASCII_LINES.join('\n'));
    });

    it('contains info panel', () => {
        const el = createNeofetchElement();
        expect(el.querySelector('.neofetch-info')).not.toBeNull();
    });

    it('contains header Terminal Cat', () => {
        const el = createNeofetchElement();
        const header = el.querySelector('.neofetch-header');
        expect(header).not.toBeNull();
        expect(header.textContent).toBe('Terminal Cat');
    });

    it('contains all 6 info key-value pairs', () => {
        const el = createNeofetchElement();
        const keys = el.querySelectorAll('.neofetch-key');
        const values = el.querySelectorAll('.neofetch-value');
        expect(keys).toHaveLength(6);
        expect(values).toHaveLength(6);
    });

    it('grid has exactly 2 children (left pre + right panel)', () => {
        const el = createNeofetchElement();
        expect(el.children.length).toBe(2);
        expect(el.children[0].classList.contains('neofetch-ascii')).toBe(true);
        expect(el.children[1].classList.contains('neofetch-info')).toBe(true);
    });
});

describe('neofetch/render — renderInstant', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.documentElement.removeAttribute('data-theme');
    });

    it('renders into given container', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        expect(container.children.length).toBeGreaterThan(0);
    });

    it('renders command line as first child', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        const cmdLine = container.querySelector('.ee-term-output__line--input');
        expect(cmdLine).not.toBeNull();
        expect(cmdLine.textContent).toBe('$ neofetch');
        expect(cmdLine.classList.contains('ee-term-output__line')).toBe(true);
    });

    it('renders neofetch grid with ASCII art', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        const grid = container.querySelector('.neofetch-grid');
        expect(grid).not.toBeNull();
        expect(grid.querySelector('.neofetch-ascii')).not.toBeNull();
        expect(grid.querySelector('.neofetch-ascii').textContent).toContain('▄██');
    });

    it('renders info panel with all keys', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        const keys = container.querySelectorAll('.neofetch-key');
        expect(keys).toHaveLength(6);
        const keyTexts = [...keys].map((k) => k.textContent.replace(': ', '').trim());
        expect(keyTexts).toContain('OS');
        expect(keyTexts).toContain('Shell');
        expect(keyTexts).toContain('Uptime');
        expect(keyTexts).toContain('Stack');
        expect(keyTexts).toContain('Theme');
        expect(keyTexts).toContain('Status');
    });

    it('renders header and divider inside grid', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        expect(container.querySelector('.neofetch-header').textContent).toBe('Terminal Cat');
        expect(container.querySelector('.neofetch-divider')).not.toBeNull();
    });

    it('container has 2 top-level children (cmd line + grid)', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        renderInstant(container);
        expect(container.children.length).toBe(2);
        expect(container.children[0].classList.contains('ee-term-output__line')).toBe(true);
        expect(container.children[1].classList.contains('neofetch-grid')).toBe(true);
    });

    it('does not throw with empty container', () => {
        const container = document.createElement('div');
        expect(() => renderInstant(container)).not.toThrow();
    });
});
