const INACTIVITY_MS = 40000;
const CHAR_DELAY_MS = 80;
const OUTPUT_DELAY_MS = 400;
const LINE_PAUSE_MS = 800;
const INITIAL_DELAY_MS = 500;
const GHOST_DURATION_MS = 8000;

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
    const { eeManager, t, showToast, reducedMotion } = ctx;

    let destroyed = false;
    let discovered = false;
    const timers = [];
    const listeners = [];
    let inactivityTimerId = null;
    let ghostActive = false;

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    function discover() {
        if (!discovered) {
            eeManager.discover('ee02');
            discovered = true;
        }
    }

    function resetInactivity() {
        clearTimeout(inactivityTimerId);
        if (!ghostActive) {
            inactivityTimerId = schedule(onInactivity, INACTIVITY_MS);
        }
    }

    function onInactivity() {
        if (destroyed || discovered || ghostActive) return;

        discover();

        if (reducedMotion) {
            if (showToast) showToast(t('ee_ghost_toast'));
            return;
        }

        const output = document.querySelector('.ee-term-output');
        const inputLine = document.querySelector('.ee-term-input');
        if (!output || !inputLine) return;

        const seed = eeManager.getSessionSeed();
        runGhost(output, inputLine, seed);
    }

    function appendOutputLine(container, text, cssClass) {
        const line = document.createElement('div');
        line.className = 'ee-term-output__line';
        if (cssClass) line.classList.add(cssClass);
        line.textContent = text;
        container.appendChild(line);
        container.scrollTop = container.scrollHeight;
        return line;
    }

    function typeInLine(line, text, charIndex, onComplete) {
        if (destroyed || charIndex >= text.length) {
            schedule(onComplete, OUTPUT_DELAY_MS);
            return;
        }
        schedule(() => {
            line.textContent += text[charIndex];
            typeInLine(line, text, charIndex + 1, onComplete);
        }, CHAR_DELAY_MS);
    }

    function runGhost(output, inputLine, seed) {
        ghostActive = true;
        inputLine.style.display = 'none';

        const scriptIndex = seed < 0.5 ? 0 : 1;
        const script = SCRIPTS[scriptIndex];
        const ghostLines = [];

        function cleanup() {
            ghostActive = false;
            for (const line of ghostLines) {
                if (line.parentNode) line.remove();
            }
            inputLine.style.display = '';
        }

        function runStep(stepIndex) {
            if (destroyed || stepIndex >= script.length) {
                return;
            }

            const step = script[stepIndex];
            schedule(
                () => {
                    const promptLine = appendOutputLine(output, '$ ', 'ee-ghost-prompt-line');
                    ghostLines.push(promptLine);

                    typeInLine(promptLine, step.cmd, 0, () => {
                        const outputLine = appendOutputLine(output, step.output, 'ee-ghost-output-line');
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
            schedule(cleanup, 1000);
        }, GHOST_DURATION_MS);
    }

    const activityEvents = ['mousemove', 'scroll', 'keydown', 'touchstart'];
    for (const event of activityEvents) {
        listen(document, event, resetInactivity);
    }

    inactivityTimerId = schedule(onInactivity, INACTIVITY_MS);

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
        },
    };
}
