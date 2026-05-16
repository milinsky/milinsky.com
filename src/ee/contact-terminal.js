import { runNeofetchCard } from './contact-terminal/neofetch-card.js';
import { runHireCommand } from './contact-terminal/hire-command.js';
import { runMailComposer } from './contact-terminal/mail-composer.js';

const SCROLL_TRIGGER_DELAY_MS = 300;
const HIRE_COMMAND = 'hire milinsky';
const INTERSECTION_THRESHOLD = 0.3;

export function createContactTerminal(ctx) {
    const { t, reducedMotion } = ctx;

    const shell = document.getElementById('contactTerminalShell');
    if (!shell) return { destroy() {} };

    let destroyed = false;
    let initialized = false;
    const timers = [];
    const intervals = [];
    const listeners = [];

    function schedule(fn, delay) {
        if (destroyed) return;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
    }

    function addInterval(fn, delay) {
        if (destroyed) return;
        const id = setInterval(() => {
            if (!destroyed) fn();
        }, delay);
        intervals.push(id);
    }

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    function appendLine(text, className) {
        const line = document.createElement('div');
        if (className) line.className = className;
        line.textContent = text;
        shell.appendChild(line);
        shell.scrollTop = shell.scrollHeight;
        return line;
    }

    function appendElement(el) {
        shell.appendChild(el);
        shell.scrollTop = shell.scrollHeight;
    }

    function buildTerminalUI() {
        const inputLine = document.createElement('div');
        inputLine.className = 'contact-nf__hint';

        const prompt = document.createElement('span');
        prompt.textContent = '$ ';
        inputLine.appendChild(prompt);

        const inputSpan = document.createElement('span');
        inputSpan.className = 'contact-mail__input';
        inputSpan.setAttribute('tabindex', '0');
        inputSpan.setAttribute('role', 'textbox');
        inputSpan.setAttribute('aria-label', t('contact_hint'));
        inputLine.appendChild(inputSpan);

        const cursor = document.createElement('span');
        cursor.className = 'contact-cursor';
        inputLine.appendChild(cursor);

        return { inputLine, inputSpan, cursor };
    }

    function handleCommand(entered, cursor) {
        cursor.remove();
        if (entered === HIRE_COMMAND) {
            runHireCommand(
                shell,
                t,
                reducedMotion,
                schedule,
                appendLine,
                appendElement,
                listen,
                () => destroyed,
                runMailComposerFlow
            );
        } else {
            appendLine(t('contact_nf_cmd_not_found'), 'contact-nf__hint');
            setupInput();
        }
    }

    function setupInput() {
        if (destroyed) return;

        const { inputLine, inputSpan, cursor } = buildTerminalUI();
        appendElement(inputLine);
        inputSpan.focus();

        let buffer = '';

        listen(inputSpan, 'keydown', (e) => {
            if (destroyed) return;
            e.preventDefault();

            if (e.key === 'Enter') {
                handleCommand(buffer.trim().toLowerCase(), cursor);
                return;
            }

            if (e.key === 'Backspace') {
                buffer = buffer.slice(0, -1);
                inputSpan.textContent = buffer;
                return;
            }

            if (e.key.length === 1) {
                buffer += e.key;
                inputSpan.textContent = buffer;
            }
        });

        listen(inputLine, 'click', () => {
            if (!destroyed) inputSpan.focus();
        });
    }

    function runMailComposerFlow() {
        runMailComposer(shell, t, reducedMotion, schedule, appendLine, appendElement, listen, () => destroyed);
    }

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !initialized) {
                    initialized = true;
                    observer.disconnect();
                    if (reducedMotion) {
                        runNeofetchCard(shell, t, reducedMotion, schedule, appendElement, setupInput, addInterval);
                    } else {
                        schedule(
                            () =>
                                runNeofetchCard(
                                    shell,
                                    t,
                                    reducedMotion,
                                    schedule,
                                    appendElement,
                                    setupInput,
                                    addInterval
                                ),
                            SCROLL_TRIGGER_DELAY_MS
                        );
                    }
                }
            },
            { threshold: INTERSECTION_THRESHOLD }
        );
        observer.observe(shell);
        return observer;
    }

    const observer = setupIntersectionObserver();

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
            for (const id of intervals) clearInterval(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
            observer.disconnect();
        },
    };
}
