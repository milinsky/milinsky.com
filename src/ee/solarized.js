/**
 * Solarized color palette dialog easter egg.
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ show(): void, destroy(): void }}
 */
export function createSolarized(ctx) {
    const { eeManager, t } = ctx;

    const listeners = [];

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    function show() {
        eeManager.discover('ee-solarized');
        const existing = document.querySelector('.ee-solarized-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'ee-solarized-overlay';
        const dialog = buildDialog(t, listen, overlay);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        listen(overlay, 'click', (ev) => {
            if (ev.target === overlay) overlay.remove();
        });
    }

    return {
        show,
        destroy() {
            for (const { target, event, handler, options } of listeners) {
                target.removeEventListener(event, handler, options);
            }
        },
    };
}

const SOLARIZED_COLORS = [
    { hex: '#002b36', name: 'base03' },
    { hex: '#073642', name: 'base02' },
    { hex: '#586e75', name: 'base01' },
    { hex: '#657b83', name: 'base00' },
    { hex: '#839496', name: 'base0' },
    { hex: '#93a1a1', name: 'base1' },
    { hex: '#eee8d5', name: 'base2' },
    { hex: '#fdf6e3', name: 'base3' },
    { hex: '#b58900', name: 'yellow' },
    { hex: '#cb4b16', name: 'orange' },
    { hex: '#dc322f', name: 'red' },
    { hex: '#d33682', name: 'magenta' },
    { hex: '#6c71c4', name: 'violet' },
    { hex: '#268bd2', name: 'blue' },
    { hex: '#2aa198', name: 'cyan' },
    { hex: '#859900', name: 'green' },
];

function buildPalette() {
    const palette = document.createElement('div');
    palette.className = 'ee-solarized-palette';
    for (const color of SOLARIZED_COLORS) {
        const swatch = document.createElement('div');
        swatch.className = 'ee-solarized-swatch';
        swatch.style.background = color.hex;
        swatch.title = `${color.name} ${color.hex}`;
        const label = document.createElement('span');
        label.className = 'ee-solarized-swatch--label';
        label.textContent = color.name;
        swatch.appendChild(label);
        palette.appendChild(swatch);
    }
    return palette;
}

function buildButtons(t, listen, response) {
    const buttons = document.createElement('div');
    buttons.className = 'ee-solarized-dialog__buttons';

    const btnConfigs = [
        { cls: 'ee-solarized-btn ee-solarized-btn--primary', key: 'ee_solar_yes', respKey: 'ee_solar_resp_yes' },
        { cls: 'ee-solarized-btn', key: 'ee_solar_no', respKey: 'ee_solar_resp_no' },
        { cls: 'ee-solarized-btn', key: 'ee_solar_what', respKey: 'ee_solar_resp_what' },
    ];

    for (const cfg of btnConfigs) {
        const btn = document.createElement('button');
        btn.className = cfg.cls;
        btn.type = 'button';
        btn.textContent = t(cfg.key);
        listen(btn, 'click', () => {
            response.textContent = t(cfg.respKey);
        });
        buttons.appendChild(btn);
    }

    return buttons;
}

function buildDialog(t, listen, overlay) {
    const dialog = document.createElement('div');
    dialog.className = 'ee-solarized-dialog';

    const headerEl = document.createElement('div');
    headerEl.className = 'ee-solarized-dialog__header';
    const title = document.createElement('span');
    title.textContent = 'SOLARIZED';
    const closeX = document.createElement('button');
    closeX.className = 'ee-solarized-dialog__close';
    closeX.textContent = '\u00D7';
    closeX.type = 'button';
    listen(closeX, 'click', () => overlay.remove());
    headerEl.appendChild(title);
    headerEl.appendChild(closeX);

    const body = document.createElement('div');
    body.className = 'ee-solarized-dialog__body';

    const text = document.createElement('div');
    text.className = 'ee-solarized-dialog__text';
    text.textContent = t('ee_solar_text');
    body.appendChild(text);
    body.appendChild(buildPalette());

    const response = document.createElement('div');
    response.className = 'ee-solarized-response';
    body.appendChild(response);
    body.appendChild(buildButtons(t, listen, response));

    dialog.appendChild(headerEl);
    dialog.appendChild(body);
    return dialog;
}
