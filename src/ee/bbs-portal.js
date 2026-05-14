import { playModemTones } from './bbs-portal/audio.js';
import { getRandomBaudRate, getMenuItems } from './bbs-portal/content.js';

const TYPE_DELAY_MS = 30;
const LINE_DELAY_MS = 200;

/**
 * EE-14: #bbs transforms the page into a 90s BBS interface with modem tones.
 * @param {{ eeManager: object, t: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createBbsPortal(ctx) {
    const { eeManager, t, reducedMotion } = ctx;

    let discovered = false;
    let savedBody = '';
    let active = false;
    let audioHandle = null;
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

    function activate() {
        if (active) return;
        active = true;

        savedBody = document.body.innerHTML;

        if (!discovered) {
            eeManager.discover('ee14');
            discovered = true;
        }

        if (!reducedMotion) {
            audioHandle = playModemTones();
        }

        const baud = getRandomBaudRate();
        const screen = document.createElement('div');
        screen.className = 'ee-bbs-screen';

        const header = document.createElement('div');
        header.className = 'ee-bbs-header';
        screen.appendChild(header);

        const content = document.createElement('div');
        content.className = 'ee-bbs-content';
        content.style.display = 'none';
        screen.appendChild(content);

        const menu = document.createElement('div');
        menu.className = 'ee-bbs-menu';
        menu.style.display = 'none';
        screen.appendChild(menu);

        document.body.innerHTML = '';
        document.body.appendChild(screen);

        const headerText =
            t('ee_bbs_connecting') + '\n\n' + t('ee_bbs_header') + '\n' + t('ee_bbs_speed').replace('{baud}', baud);
        typewriterEffect(header, headerText, () => {
            content.style.display = '';
            menu.style.display = '';
            renderMenu(menu, content);
        });
    }

    function typewriterEffect(el, text, onComplete) {
        const lines = text.split('\n');
        let lineIdx = 0;
        let charIdx = 0;
        let current = '';

        function step() {
            if (lineIdx >= lines.length) {
                if (onComplete) schedule(onComplete, LINE_DELAY_MS);
                return;
            }
            const line = lines[lineIdx];
            if (charIdx < line.length) {
                current += line[charIdx];
                el.textContent = current + '\n'.repeat(lines.length - lineIdx);
                charIdx++;
                schedule(step, TYPE_DELAY_MS);
            } else {
                current += '\n';
                el.textContent = current;
                lineIdx++;
                charIdx = 0;
                schedule(step, LINE_DELAY_MS);
            }
        }
        step();
    }

    function renderMenu(menuEl, contentEl) {
        menuEl.innerHTML = '';
        const items = getMenuItems(t);
        for (const item of items) {
            const div = document.createElement('div');
            div.className = 'ee-bbs-menu__item';
            div.textContent = '[' + item.key + '] ' + item.label;
            listen(div, 'click', () => handleMenuChoice(item, contentEl));
            menuEl.appendChild(div);
        }
    }

    function handleMenuChoice(item, contentEl) {
        if (item.key === '4') {
            exitBbs();
            return;
        }
        contentEl.textContent = item.content;
        schedule(() => {
            contentEl.textContent = '';
        }, 3000);
    }

    function exitBbs() {
        document.body.innerHTML = savedBody;
        savedBody = '';
        active = false;
        if (audioHandle) {
            audioHandle.stop();
            audioHandle = null;
        }
        window.location.hash = '';
    }

    function onHashChange() {
        if (window.location.hash === '#bbs') {
            activate();
        }
    }

    listen(window, 'hashchange', onHashChange);

    if (window.location.hash === '#bbs') {
        schedule(activate, 0);
    }

    return {
        destroy() {
            for (const id of timers) clearTimeout(id);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
            if (audioHandle) {
                audioHandle.stop();
                audioHandle = null;
            }
            if (active) {
                document.body.innerHTML = savedBody;
                active = false;
            }
        },
    };
}
