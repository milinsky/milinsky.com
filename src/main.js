import { createEeManager } from './ee-manager.js';
import { translations } from './translations.js';
import { eeT, applyLanguage } from './i18n.js';
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initTyping } from './typing.js';
import { initScrollProgress } from './scroll-progress.js';
import { initVisualEffects } from './visual-effects.js';
import { initScrollTracking } from './scroll-tracking.js';
import { eeShowToast } from './ee/toast.js';
import { initConsoleDrop } from './ee/console-drop.js';
import { initLogoReveal } from './ee/logo-reveal.js';
import { initLogoMorph } from './ee/logo-morph.js';
import { initContextMenu } from './ee/context-menu.js';
import { eeShowSolarizedDialog } from './ee/solarized.js';
import { initSelectSecret } from './ee/select-secret.js';
import { initVisitCounter } from './ee/visit-counter.js';

const eeManager = createEeManager();

const eeLogoPre = document.querySelector('.nav__logo-ascii');
let eeOriginalLogo = '';
if (eeLogoPre) {
    eeOriginalLogo = eeLogoPre.textContent;
}

const html = document.documentElement;
const storedLang = localStorage.getItem('lang');
let currentLang = storedLang || 'en';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const boundEeT = (key) => eeT(key, translations, currentLang);

initConsoleDrop(eeManager, boundEeT);

html.setAttribute('lang', currentLang);

const boundApplyLanguage = (lang) => {
    currentLang = lang;
    applyLanguage(lang, translations);
};
boundApplyLanguage(currentLang);

initLogoReveal(reducedMotion);

const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'ru' : 'en';
        localStorage.setItem('lang', nextLang);
        boundApplyLanguage(nextLang);
        restartTyping();
    });
}

initTheme(html, () => eeShowSolarizedDialog(eeManager, boundEeT));

initNavigation();

const { restartTyping } = initTyping(translations, () => currentLang);

initScrollProgress();

const sectionLabels = document.querySelectorAll('.section__label[data-section]');
initVisualEffects(sectionLabels);

const sections = document.querySelectorAll('section[id]');
initScrollTracking(sections);

initLogoMorph(eeManager, {
    logoPre: eeLogoPre,
    originalLogo: eeOriginalLogo,
    reducedMotion,
    showToast: eeShowToast,
    t: boundEeT,
});

initContextMenu(eeManager, boundEeT, eeShowToast, html);

initSelectSecret(eeManager, boundEeT);

initVisitCounter(eeManager, boundEeT);
