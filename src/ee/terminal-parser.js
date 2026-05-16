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

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    const terminalFrame = document.querySelector('.hero__terminal-frame');
    if (!terminalFrame) return { destroy() {} };

    const shell = document.querySelector('.hero__terminal-shell');
    if (!shell) return { destroy() {} };

    const commands = createCommands({ t, sessionSeed: eeManager.getSessionSeed() });
    const ui = buildUI(reducedMotion);
    shell.appendChild(ui.outputContainer);
    shell.appendChild(ui.inputLine);

    const state = {
        discovered: false,
        active: false,
        inputBuffer: '',
    };

    listen(terminalFrame, 'click', () => {
        if (destroyed) return;
        if (!state.active) {
            state.active = true;
            terminalFrame.classList.add('ee-term-active');
        }
    });

    listen(document, 'keydown', (e) => {
        if (destroyed || !state.active) return;
        handleKeyDown(e, state, terminalFrame, ui, commands, shell, eeManager);
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

function buildUI(reducedMotion) {
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

    return { outputContainer, inputLine };
}

function refreshInput(inputLine, inputBuffer) {
    const prefixNode = inputLine.firstChild;
    prefixNode.textContent = PROMPT_PREFIX + inputBuffer;
}

function appendOutput(outputContainer, shell, text, isInput) {
    const line = document.createElement('div');
    line.className = 'ee-term-output__line';
    if (isInput) {
        line.classList.add('ee-term-output__line--input');
    }
    line.textContent = text;
    outputContainer.appendChild(line);
    shell.scrollTop = shell.scrollHeight;
}

function processResult(result, state, terminalFrame, outputContainer, shell, eeManager) {
    if (!result) return;
    if (result.discover && !state.discovered) {
        state.discovered = true;
        eeManager.discover('ee09');
    }
    if (result.dim) {
        terminalFrame.classList.add('ee-term-dimmed');
    } else {
        terminalFrame.classList.remove('ee-term-dimmed');
    }
    appendResultContent(result, outputContainer, shell);
}

function appendResultContent(result, outputContainer, shell) {
    if (result.element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ee-term-output__line';
        wrapper.appendChild(result.element);
        outputContainer.appendChild(wrapper);
    } else {
        const line = document.createElement('div');
        line.className = 'ee-term-output__line';
        line.textContent = result.text;
        outputContainer.appendChild(line);
    }
    shell.scrollTop = shell.scrollHeight;
}

function handleKeyDown(e, state, terminalFrame, ui, commands, shell, eeManager) {
    if (e.key === 'Escape') {
        e.preventDefault();
        state.active = false;
        state.inputBuffer = '';
        terminalFrame.classList.remove('ee-term-active');
        refreshInput(ui.inputLine, state.inputBuffer);
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        const input = state.inputBuffer;
        appendOutput(ui.outputContainer, shell, PROMPT_PREFIX + input, true);
        state.inputBuffer = '';
        refreshInput(ui.inputLine, state.inputBuffer);
        processResult(commands.execute(input), state, terminalFrame, ui.outputContainer, shell, eeManager);
        return;
    }

    if (e.key === 'Backspace') {
        e.preventDefault();
        state.inputBuffer = state.inputBuffer.slice(0, -1);
        refreshInput(ui.inputLine, state.inputBuffer);
        return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        state.inputBuffer += e.key;
        refreshInput(ui.inputLine, state.inputBuffer);
    }
}
