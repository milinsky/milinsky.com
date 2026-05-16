const SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
];
const BIOS_KEYS = ['ee_konami_bios_1', 'ee_konami_bios_2', 'ee_konami_bios_3'];
const CRT_GLITCH_MS = 1000;
const TYPEWRITER_LINE_MS = 80;
const TYPEWRITER_CHAR_MS = 30;
const SEED_YEAR_MULTIPLIER = 10000;
const SEED_MONTH_MULTIPLIER = 100;

function getDailySeed() {
    const d = new Date();
    return d.getFullYear() * SEED_YEAR_MULTIPLIER + (d.getMonth() + 1) * SEED_MONTH_MULTIPLIER + d.getDate();
}

/**
 * EE-01: Konami Code triggers a full-screen BIOS screen with variable messages.
 * @param {{ eeManager: object, t: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createKonami(ctx) {
    const { eeManager, t, reducedMotion } = ctx;

    let discovered = false;
    let index = 0;
    const timers = [];
    const listeners = [];

    function schedule(fn, delay) {
        const id = setTimeout(fn, delay);
        timers.push(id);
        return id;
    }

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    function closeOverlay(overlay) {
        overlay.remove();
    }

    function createBiosOverlay(text) {
        const overlay = document.createElement('div');
        overlay.className = 'ee-bios-overlay';

        const textEl = document.createElement('pre');
        textEl.className = 'ee-bios-overlay__text';

        if (reducedMotion) {
            textEl.textContent = text;
        } else {
            const lines = text.split('\n');
            let lineIdx = 0;
            let charIdx = 0;
            let current = '';
            function typeLine() {
                if (lineIdx >= lines.length) return;
                const line = lines[lineIdx];
                if (charIdx < line.length) {
                    current += line[charIdx];
                    textEl.textContent = current + '\n'.repeat(lines.length - lineIdx - 1 > 0 ? 1 : 0);
                    charIdx++;
                    schedule(typeLine, TYPEWRITER_CHAR_MS);
                } else {
                    current += '\n';
                    textEl.textContent = current;
                    lineIdx++;
                    charIdx = 0;
                    schedule(typeLine, TYPEWRITER_LINE_MS);
                }
            }
            textEl.textContent = '\n'.repeat(lines.length - 1);
            schedule(typeLine, TYPEWRITER_LINE_MS);
        }

        overlay.appendChild(textEl);
        document.body.appendChild(overlay);

        listen(overlay, 'click', () => closeOverlay(overlay));
    }

    function onKeydown(e) {
        const expected = SEQUENCE[index];
        if (e.code === expected) {
            index++;
            if (index >= SEQUENCE.length) {
                index = 0;
                triggerBios();
            }
        } else {
            const matchOffset = SEQUENCE.indexOf(e.code);
            if (matchOffset === 0) {
                index = 1;
            } else {
                index = 0;
            }
        }
    }

    function triggerBios() {
        if (!discovered) {
            eeManager.discover('ee01');
            discovered = true;
        }

        const seed = getDailySeed();
        const msgKey = BIOS_KEYS[seed % BIOS_KEYS.length];
        const text = t(msgKey);

        const htmlEl = document.documentElement;
        if (!reducedMotion) {
            htmlEl.classList.add('ee-crt-glitch');
            schedule(() => {
                htmlEl.classList.remove('ee-crt-glitch');
                createBiosOverlay(text);
            }, CRT_GLITCH_MS);
        } else {
            createBiosOverlay(text);
        }
    }

    function onEscape(e) {
        if (e.code === 'Escape') {
            const overlay = document.querySelector('.ee-bios-overlay');
            if (overlay) closeOverlay(overlay);
        }
    }

    listen(document, 'keydown', onKeydown);
    listen(document, 'keydown', onEscape);

    return {
        destroy() {
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
        },
    };
}
