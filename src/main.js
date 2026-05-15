import { createEeManager } from './ee-manager.js';
import { translations } from './translations.js';
import { eeT, applyLanguage } from './i18n.js';
import { getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initTyping } from './typing.js';
import { initScrollProgress } from './scroll-progress.js';
import { initVisualEffects } from './visual-effects.js';
import { initScrollTracking } from './scroll-tracking.js';
import { showToast } from './utils/toast.js';
import { createConsoleDrop } from './ee/console-drop.js';
import { createLogoReveal } from './logo-reveal.js';
import { createLogoMorph } from './ee/logo-morph.js';
import { createContextMenu } from './ee/context-menu.js';
import { createSolarized } from './ee/solarized.js';
import { createSelectSecret } from './ee/select-secret.js';
import { createVisitCounter } from './ee/visit-counter.js';
import { createPrintResume } from './ee/print-resume.js';
import { createTripleClick } from './ee/triple-click.js';
import { createThemeSpeedrun } from './ee/theme-speedrun.js';
import { createDragResist } from './ee/drag-resist.js';
import { createNeofetch } from './ee/neofetch.js';
import { createGhostTerminal } from './ee/ghost-terminal.js';
import { createTerminalParser } from './ee/terminal-parser.js';
import { createKonami } from './ee/konami.js';
import { createShake } from './ee/shake.js';
import { createBbsPortal } from './ee/bbs-portal.js';
import { createTimeTraveler } from './ee/time-traveler.js';
import { createOverscrollSecret } from './ee/overscroll-secret.js';
import { createAchievements } from './ee/achievements.js';

const html = document.documentElement;
const reducedMotion = getState('reducedMotion');

const t = (key) => eeT(key, translations, getState('lang'));

const currentLang = getState('lang');
html.setAttribute('lang', currentLang);
applyLanguage(currentLang, translations);

subscribe('lang', (lang) => {
    html.setAttribute('lang', lang);
    applyLanguage(lang, translations);
});

const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        const nextLang = getState('lang') === 'en' ? 'ru' : 'en';
        localStorage.setItem('lang', nextLang);
        setState('lang', nextLang);
    });
}

const cleanups = [];

function safeInit(name, initFn) {
    try {
        const result = initFn();
        if (result && typeof result.destroy === 'function') {
            cleanups.push(result.destroy);
        }
    } catch (e) {
        console.warn(`[init] Failed to init ${name}:`, e);
    }
}

const eeManager = createEeManager();
eeManager.recordVisit();

let solarized = { show() {} };
safeInit('solarized', () => {
    solarized = createSolarized({ eeManager, t });
    return solarized;
});

safeInit('theme', () => initTheme(html, () => solarized.show()));

safeInit('navigation', () => initNavigation());

safeInit('logoReveal', () => createLogoReveal({ reducedMotion }));

let restartTyping = () => {};
let achievements = null;
safeInit('typing', () => {
    const result = initTyping(translations, () => getState('lang'));
    restartTyping = result.restartTyping;
    return result;
});
subscribe('lang', () => {
    restartTyping();
    if (achievements) achievements.updateLanguage();
});

safeInit('scrollProgress', () => initScrollProgress());

safeInit('visualEffects', () => initVisualEffects());

safeInit('scrollTracking', () => initScrollTracking());

safeInit('consoleDrop', () => createConsoleDrop({ eeManager, t }));
safeInit('logoMorph', () => createLogoMorph({ eeManager, t, showToast, reducedMotion }));

let printResumeFn = null;
safeInit('printResume', () => {
    const pr = createPrintResume({ eeManager, t });
    printResumeFn = pr.printResume;
    return pr;
});

safeInit('contextMenu', () => createContextMenu({ eeManager, t, showToast, html, printResume: printResumeFn }));
safeInit('selectSecret', () => createSelectSecret({ eeManager, t }));
safeInit('visitCounter', () => createVisitCounter({ eeManager, t }));
safeInit('dragResist', () => createDragResist({ eeManager, t, showToast }));
safeInit('tripleClick', () => createTripleClick({ eeManager, t }));
safeInit('themeSpeedrun', () => createThemeSpeedrun({ eeManager, t, showToast, reducedMotion }));
safeInit('ghostTerminal', () => createGhostTerminal({ eeManager, t, showToast, reducedMotion }));
safeInit('neofetch', () => {
    const result = createNeofetch({ t, reducedMotion });
    result.done
        .then(() => {
            safeInit('terminalParser', () => createTerminalParser({ eeManager, t, reducedMotion }));
        })
        .catch(() => {});
    return result;
});
safeInit('konami', () => createKonami({ eeManager, t, reducedMotion }));
safeInit('shake', () => createShake({ eeManager, t, showToast, reducedMotion }));
safeInit('bbsPortal', () => createBbsPortal({ eeManager, t, reducedMotion }));
safeInit('timeTraveler', () => createTimeTraveler({ eeManager, t, showToast }));
safeInit('overscrollSecret', () => createOverscrollSecret({ eeManager, t, showToast, reducedMotion }));
safeInit('achievements', () => {
    achievements = createAchievements({ eeManager, t });
    return achievements;
});
