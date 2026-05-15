import { renderInstant, ASCII_LINES, DIVIDER, getInfoLines } from './neofetch/render.js';

const CHAR_DELAY_MS = 40;
const LINE_DELAY_MS = 80;
const INITIAL_DELAY_MS = 500;
const POST_CMD_DELAY_MS = 300;
const HEADER_DELAY_MULTIPLIER = 2;
const DONE_RESOLVE_DELAY_MS = 100;

export { createNeofetchElement } from './neofetch/render.js';

/**
 * @param {{ t: function, reducedMotion?: boolean }} ctx
 * @returns {{ destroy(): void, done: Promise<void> }}
 */
export function createNeofetch(ctx) {
    const { reducedMotion } = ctx;

    let destroyed = false;
    const timers = [];
    let resolveDone = null;
    const done = new Promise((r) => {
        resolveDone = r;
    });

    function schedule(fn, delay) {
        if (destroyed) return;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
    }

    const shell = document.querySelector('.hero__terminal-shell');
    if (!shell) {
        resolveDone();
        return { destroy() {}, done };
    }

    const container = document.createElement('div');
    container.className = 'neofetch-output';
    shell.appendChild(container);

    if (reducedMotion) {
        renderInstant(container);
        resolveDone();
        return {
            destroy() {
                destroyed = true;
                for (const id of timers) clearTimeout(id);
            },
            done,
        };
    }

    let delay = INITIAL_DELAY_MS;

    const cmdLine = document.createElement('div');
    cmdLine.className = 'ee-term-output__line ee-term-output__line--input';
    container.appendChild(cmdLine);

    const cmdText = '$ neofetch';
    for (const ch of cmdText) {
        schedule(() => {
            cmdLine.textContent += ch;
            shell.scrollTop = shell.scrollHeight;
        }, delay);
        delay += CHAR_DELAY_MS;
    }

    delay += POST_CMD_DELAY_MS;

    const grid = document.createElement('div');
    grid.className = 'neofetch-grid';
    container.appendChild(grid);

    const left = document.createElement('pre');
    left.className = 'neofetch-ascii';
    grid.appendChild(left);

    const right = document.createElement('div');
    right.className = 'neofetch-info';
    grid.appendChild(right);

    for (const line of ASCII_LINES) {
        schedule(() => {
            left.textContent += line + '\n';
            shell.scrollTop = shell.scrollHeight;
        }, delay);
        delay += LINE_DELAY_MS;
    }

    schedule(() => {
        const header = document.createElement('div');
        header.className = 'neofetch-header';
        header.textContent = 'Mikhail@Ilinsky';
        right.appendChild(header);

        const dividerEl = document.createElement('div');
        dividerEl.className = 'neofetch-divider';
        dividerEl.textContent = DIVIDER;
        right.appendChild(dividerEl);
        shell.scrollTop = shell.scrollHeight;
    }, delay);
    delay += LINE_DELAY_MS * HEADER_DELAY_MULTIPLIER;

    const infoLines = getInfoLines();
    for (const info of infoLines) {
        schedule(() => {
            const line = document.createElement('div');
            const keySpan = document.createElement('span');
            keySpan.className = 'neofetch-key';
            keySpan.textContent = info.key + ': ';
            const valueSpan = document.createElement('span');
            valueSpan.className = 'neofetch-value';
            valueSpan.textContent = info.value;
            line.appendChild(keySpan);
            line.appendChild(valueSpan);
            right.appendChild(line);
            shell.scrollTop = shell.scrollHeight;
        }, delay);
        delay += LINE_DELAY_MS;
    }

    schedule(() => {
        resolveDone();
    }, delay + DONE_RESOLVE_DELAY_MS);

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        },
        done,
    };
}
