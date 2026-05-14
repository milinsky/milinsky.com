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
safeInit('typing', () => {
    const result = initTyping(translations, () => getState('lang'));
    restartTyping = result.restartTyping;
    return result;
});
subscribe('lang', () => {
    restartTyping();
});

safeInit('scrollProgress', () => initScrollProgress());

const sectionLabels = document.querySelectorAll('.section__label[data-section]');
safeInit('visualEffects', () => initVisualEffects(sectionLabels));

const sections = document.querySelectorAll('section[id]');
safeInit('scrollTracking', () => initScrollTracking(sections));

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
