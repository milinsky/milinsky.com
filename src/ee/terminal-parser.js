import { createCommands } from './terminal-parser/commands.js';

const PROMPT_PREFIX = '$ ';

/**
 * EE-09: Interactive terminal command parser.
 * Click terminal, type commands, get responses in retro-terminal style.
 * @param {{ eeManager: object, t: function, reducedMotion?: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createTerminalParser(ctx) {
    const { eeManager, t, reducedMotion } = ctx;

    const listeners = [];
    let destroyed = false;
    let discovered = false;
    let active = false;
    let inputBuffer = '';

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    const terminalFrame = document.querySelector('.hero__terminal-frame');
    if (!terminalFrame) return { destroy() {} };

    const shell = document.querySelector('.hero__terminal-shell');
    if (!shell) return { destroy() {} };

    const commands = createCommands(t, eeManager.getSessionSeed());

    const outputContainer = document.createElement('div');
    outputContainer.className = 'ee-term-output';

    const inputLine = document.createElement('div');
    inputLine.className = 'ee-term-input';
    inputLine.textContent = PROMPT_PREFIX;

    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'ee-term-cursor';
    cursorSpan.textContent = reducedMotion ? '_' : '';
    cursorSpan.setAttribute('aria-hidden', 'true');
    inputLine.appendChild(cursorSpan);

    shell.appendChild(outputContainer);
    shell.appendChild(inputLine);

    function refreshInput() {
        const prefixNode = inputLine.firstChild;
        prefixNode.textContent = PROMPT_PREFIX + inputBuffer;
    }

    function appendOutput(text, isInput) {
        const line = document.createElement('div');
        line.className = 'ee-term-output__line';
        if (isInput) {
            line.classList.add('ee-term-output__line--input');
        }
        line.textContent = text;
        outputContainer.appendChild(line);
        shell.scrollTop = shell.scrollHeight;
    }

    function activate() {
        if (active || destroyed) return;
        active = true;
        terminalFrame.classList.add('ee-term-active');
    }

    function deactivate() {
        active = false;
        inputBuffer = '';
        terminalFrame.classList.remove('ee-term-active');
        refreshInput();
    }

    function processResult(result) {
        if (!result) return;
        if (result.discover && !discovered) {
            discovered = true;
            eeManager.discover('ee09');
        }
        if (result.dim) {
            terminalFrame.classList.add('ee-term-dimmed');
        } else {
            terminalFrame.classList.remove('ee-term-dimmed');
        }
        if (result.element) {
            const wrapper = document.createElement('div');
            wrapper.className = 'ee-term-output__line';
            wrapper.appendChild(result.element);
            outputContainer.appendChild(wrapper);
            shell.scrollTop = shell.scrollHeight;
        } else {
            appendOutput(result.text, false);
        }
    }

    listen(terminalFrame, 'click', () => {
        if (destroyed) return;
        activate();
    });

    listen(document, 'keydown', (e) => {
        if (destroyed || !active) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            deactivate();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const input = inputBuffer;
            appendOutput(PROMPT_PREFIX + input, true);
            inputBuffer = '';
            refreshInput();
            const result = commands.execute(input);
            processResult(result);
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            inputBuffer = inputBuffer.slice(0, -1);
            refreshInput();
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            inputBuffer += e.key;
            refreshInput();
        }
    });

    return {
        destroy() {
            destroyed = true;
            for (const { target, event, handler, options } of listeners) {
                target.removeEventListener(event, handler, options);
            }
        },
    };
}
