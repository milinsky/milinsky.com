const ASCII_LINES = [
    '     ▄██  ██▄',
    '    ▄███▓▓███▄',
    '    █ ▀█  █▀ █',
    '    ▀▄  ▀▀  ▄▀',
    '     ▀██████▀    ██',
    '    ▄██▓▓▓▓▓█▄   ██',
    '   ██▓▓▓▓▓▓▓▓██ ██',
    '  ███▓▓▓▓▓▓▓▓████',
    '  █████▓▓▓▓█████',
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

function buildInfoRows(right) {
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
}

function buildRightPanel() {
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

    buildInfoRows(right);
    return right;
}

/**
 * Creates a static neofetch grid element (no animation).
 * Used by terminal 'neofetch' command for instant display.
 * @returns {HTMLElement} .neofetch-grid element
 */
export function createNeofetchElement() {
    const grid = document.createElement('div');
    grid.className = 'neofetch-grid';

    const left = document.createElement('pre');
    left.className = 'neofetch-ascii';
    left.textContent = ASCII_LINES.join('\n');
    grid.appendChild(left);

    grid.appendChild(buildRightPanel());
    return grid;
}

/**
 * Renders the full neofetch output instantly into the given container.
 * No animation — all elements appear immediately.
 * @param {HTMLElement} container - The container element to render into
 */
export function renderInstant(container) {
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

    grid.appendChild(buildRightPanel());
}

export { ASCII_LINES, DIVIDER, getInfoLines, buildRightPanel };
