const INACTIVITY_MS = 40000;
const CHAR_DELAY_MS = 80;
const OUTPUT_DELAY_MS = 400;
const LINE_PAUSE_MS = 800;
const INITIAL_DELAY_MS = 500;
const GHOST_DURATION_MS = 8000;
const SCRIPT_SELECT_THRESHOLD = 0.5;
const GHOST_FADE_MS = 1000;

const SCRIPTS = [
    [
        { cmd: 'ls /etc/', output: 'passwd  shadow  hosts  secrets.txt' },
        { cmd: 'cat secrets.txt', output: "hmm, should I... or shouldn't I?" },
    ],
    [
        { cmd: 'ls ~/projects/', output: 'duyler/  landing/  secret_stuff/' },
        { cmd: 'cat ~/projects/secret_stuff/log.txt', output: 'nothing to see here... or is there?' },
    ],
];

export function createGhostTerminal(ctx) {
    const state = { destroyed: false, discovered: false, ghostActive: false };
    const timers = [];
    const listeners = [];
    let inactivityTimerId = null;

    function schedule(fn, delay) {
        if (state.destroyed) return null;
        const id = setTimeout(() => {
            if (!state.destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    function onInactivity() {
        triggerGhostInactivity(ctx, state, schedule);
    }

    function resetInactivity() {
        clearTimeout(inactivityTimerId);
        if (!state.ghostActive) {
            inactivityTimerId = schedule(onInactivity, INACTIVITY_MS);
        }
    }

    const activityEvents = ['mousemove', 'scroll', 'keydown', 'touchstart'];
    for (const event of activityEvents) {
        listen(document, event, resetInactivity);
    }
    inactivityTimerId = schedule(onInactivity, INACTIVITY_MS);

    return {
        destroy() {
            state.destroyed = true;
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
        },
    };
}

function triggerGhostInactivity(ctx, state, schedule) {
    if (state.destroyed || state.discovered || state.ghostActive) return;
    if (!state.discovered) {
        ctx.eeManager.discover('ee02');
        state.discovered = true;
    }
    if (ctx.reducedMotion) {
        if (ctx.showToast) ctx.showToast(ctx.t('ee_ghost_toast'));
        return;
    }
    const output = document.querySelector('.ee-term-output');
    const inputLine = document.querySelector('.ee-term-input');
    const shell = document.querySelector('.hero__terminal-shell');
    if (!output || !inputLine) return;
    state.ghostActive = true;
    runGhost(output, inputLine, shell, ctx.eeManager.getSessionSeed(), state, schedule, () => {
        state.ghostActive = false;
    });
}

function selectScript(seed) {
    const scriptIndex = seed < SCRIPT_SELECT_THRESHOLD ? 0 : 1;
    return SCRIPTS[scriptIndex];
}

function appendOutputLine(container, shellEl, text, cssClass) {
    const line = document.createElement('div');
    line.className = 'ee-term-output__line';
    if (cssClass) line.classList.add(cssClass);
    line.textContent = text;
    container.appendChild(line);
    if (shellEl) shellEl.scrollTop = shellEl.scrollHeight;
    return line;
}

function runGhost(output, inputLine, shell, seed, state, schedule, onCleanup) {
    inputLine.style.display = 'none';

    const script = selectScript(seed);
    const ghostLines = [];

    function cleanup() {
        for (const line of ghostLines) {
            if (line.parentNode) line.remove();
        }
        inputLine.style.display = '';
        onCleanup();
    }

    runScriptSteps(output, shell, script, ghostLines, state, schedule, cleanup);
}

function runScriptSteps(output, shell, script, ghostLines, state, schedule, cleanup) {
    function typeInLine(line, text, charIndex, onComplete) {
        if (state.destroyed || charIndex >= text.length) {
            schedule(onComplete, OUTPUT_DELAY_MS);
            return;
        }
        schedule(() => {
            line.textContent += text[charIndex];
            typeInLine(line, text, charIndex + 1, onComplete);
        }, CHAR_DELAY_MS);
    }

    function runStep(stepIndex) {
        if (state.destroyed || stepIndex >= script.length) return;

        const step = script[stepIndex];
        schedule(
            () => {
                const promptLine = appendOutputLine(output, shell, '$ ', 'ee-ghost-prompt-line');
                ghostLines.push(promptLine);

                typeInLine(promptLine, step.cmd, 0, () => {
                    const outputLine = appendOutputLine(output, shell, step.output, 'ee-ghost-output-line');
                    ghostLines.push(outputLine);
                    schedule(() => runStep(stepIndex + 1), LINE_PAUSE_MS);
                });
            },
            stepIndex === 0 ? INITIAL_DELAY_MS : 0
        );
    }

    runStep(0);

    schedule(() => {
        for (const line of ghostLines) {
            line.classList.add('ee-term-output__line--fade');
        }
        schedule(cleanup, GHOST_FADE_MS);
    }, GHOST_DURATION_MS);
}
