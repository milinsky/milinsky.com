import { ASCII_LINES } from '../neofetch/render.js';

const CLOCK_TICK_MS = 1000;

function formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function runNeofetchCard(shell, t, reducedMotion, schedule, appendElement, onDone, addInterval) {
    const grid = document.createElement('div');
    grid.className = 'contact-nf__grid';

    const ascii = document.createElement('pre');
    ascii.className = 'contact-nf__ascii';
    ascii.textContent = ASCII_LINES.join('\n');
    grid.appendChild(ascii);

    const info = document.createElement('div');
    info.className = 'contact-nf__info';

    const header = document.createElement('div');
    header.className = 'contact-nf__header';
    header.textContent = t('contact_nf_os');
    info.appendChild(header);

    const fields = [
        ['Host', t('contact_nf_host')],
        ['Kernel', t('contact_nf_kernel')],
        ['Uptime', t('contact_nf_uptime')],
        ['Shell', t('contact_nf_shell')],
        ['Mail', t('contact_nf_mail')],
        ['TG', t('contact_nf_tg')],
        ['TZ', t('contact_nf_tz')],
        ['Status', t('contact_nf_status')],
    ];

    for (const [key, value] of fields) {
        const line = document.createElement('div');
        const keySpan = document.createElement('span');
        keySpan.className = 'contact-nf__key';
        keySpan.textContent = key + ': ';
        const valueSpan = document.createElement('span');
        valueSpan.className = 'contact-nf__value';
        valueSpan.textContent = value;
        line.appendChild(keySpan);
        line.appendChild(valueSpan);
        info.appendChild(line);
    }

    const timeLine = document.createElement('div');
    const timeKey = document.createElement('span');
    timeKey.className = 'contact-nf__key';
    timeKey.textContent = 'Time: ';
    const timeValue = document.createElement('span');
    timeValue.className = 'contact-nf__value';
    timeValue.textContent = formatTime();
    timeLine.appendChild(timeKey);
    timeLine.appendChild(timeValue);
    info.appendChild(timeLine);

    grid.appendChild(info);
    appendElement(grid);

    addInterval(() => {
        timeValue.textContent = formatTime();
    }, CLOCK_TICK_MS);

    const hint = document.createElement('div');
    hint.className = 'contact-nf__hint';
    hint.textContent = '> ' + t('contact_hint');
    appendElement(hint);

    schedule(onDone, reducedMotion ? 0 : 200);
}
