const CHAR_DELAY_MS = 40;
const LINE_DELAY_MS = 80;
const INITIAL_DELAY_MS = 500;
const POST_CMD_DELAY_MS = 300;

const ASCII_LINES = [
    '  ┌─────────────┐',
    '  │   •     •   │',
    '  │       ▼     │',
    '  │    ╲────╱   │',
    '  └─────────────┘',
    '  ┌──┬──┬──┬──┬──┐',
    '  │▓▓│▓▓│▓▓│▓▓│▓▓│',
    '  └──┴──┴──┴──┴──┘',
];

const DIVIDER = '─────────────────────────';

function getThemeName() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'Solarized Light' : 'Solarized Dark';
}

function getInfoLines() {
    return [
        { key: 'OS', value: 'MILINSKY.OS v4.2.0' },
        { key: 'Shell', value: 'milinsky.sh' },
        { key: 'Uptime', value: '9+ years' },
        { key: 'Stack', value: 'PHP / Java / AI' },
        { key: 'Theme', value: getThemeName() },
        { key: 'Status', value: '● Available' },
    ];
}

export function createNeofetchElement() {
    const grid = document.createElement('div');
    grid.className = 'neofetch-grid';

    const left = document.createElement('pre');
    left.className = 'neofetch-ascii';
    left.textContent = ASCII_LINES.join('\n');
    grid.appendChild(left);

    const right = document.createElement('div');
    right.className = 'neofetch-info';

    const header = document.createElement('div');
    header.className = 'neofetch-header';
    header.textContent = 'Mikhail@Ilinsky';
    right.appendChild(header);

    const dividerEl = document.createElement('div');
    dividerEl.className = 'neofetch-divider';
    dividerEl.textContent = DIVIDER;
    right.appendChild(dividerEl);

    for (const info of getInfoLines()) {
        const line = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'neofetch-key';
        key.textContent = info.key + ': ';
        const value = document.createElement('span');
        value.className = 'neofetch-value';
        value.textContent = info.value;
        line.appendChild(key);
        line.appendChild(value);
        right.appendChild(line);
    }
    grid.appendChild(right);

    return grid;
}

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
    for (let i = 0; i < cmdText.length; i++) {
        const ch = cmdText[i];
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
    delay += LINE_DELAY_MS * 2;

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
    }, delay + 100);

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        },
        done,
    };
}

function renderInstant(container) {
    const cmdLine = document.createElement('div');
    cmdLine.className = 'ee-term-output__line ee-term-output__line--input';
    cmdLine.textContent = '$ neofetch';
    container.appendChild(cmdLine);

    const grid = document.createElement('div');
    grid.className = 'neofetch-grid';
    container.appendChild(grid);

    const left = document.createElement('pre');
    left.className = 'neofetch-ascii';
    left.textContent = ASCII_LINES.join('\n');
    grid.appendChild(left);

    const right = document.createElement('div');
    right.className = 'neofetch-info';

    const header = document.createElement('div');
    header.className = 'neofetch-header';
    header.textContent = 'Mikhail@Ilinsky';
    right.appendChild(header);

    const dividerEl = document.createElement('div');
    dividerEl.className = 'neofetch-divider';
    dividerEl.textContent = DIVIDER;
    right.appendChild(dividerEl);

    for (const info of getInfoLines()) {
        const line = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'neofetch-key';
        key.textContent = info.key + ': ';
        const value = document.createElement('span');
        value.className = 'neofetch-value';
        value.textContent = info.value;
        line.appendChild(key);
        line.appendChild(value);
        right.appendChild(line);
    }
    grid.appendChild(right);
}
