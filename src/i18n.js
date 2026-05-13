/**
 * @module i18n
 */

/**
 * Translate a key using the given translations map and language.
 * @param {string} key - Translation key.
 * @param {Object<string, {en: string, ru: string}>} translations - Translations map.
 * @param {string} currentLang - Current language code.
 * @returns {string} Translated text or the key itself as fallback.
 */
export function eeT(key, translations, currentLang) {
    if (translations[key] && translations[key][currentLang]) {
        return translations[key][currentLang];
    }
    if (translations[key] && translations[key].en) {
        return translations[key].en;
    }
    return key;
}

/**
 * Apply a language to all i18n-enabled DOM elements.
 * @param {string} lang - Language code to apply.
 * @param {Object<string, {en: string, ru: string}>} translations - Translations map.
 */
export function applyLanguage(lang, translations) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);

    const elements = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < elements.length; i++) {
        const key = elements[i].getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
            elements[i].textContent = translations[key][lang];
        }
    }

    const htmlElements = document.querySelectorAll('[data-i18n-html]');
    for (let j = 0; j < htmlElements.length; j++) {
        const hKey = htmlElements[j].getAttribute('data-i18n-html');
        if (translations[hKey] && translations[hKey][lang]) {
            htmlElements[j].innerHTML = translations[hKey][lang];
        }
    }

    if (translations.meta_description && translations.meta_description[lang]) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', translations.meta_description[lang]);
    }
    if (translations.og_description && translations.og_description[lang]) {
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', translations.og_description[lang]);
    }
    if (translations.page_title && translations.page_title[lang]) {
        document.title = translations.page_title[lang];
    }

    const burger = document.getElementById('navBurger');
    if (burger && translations.aria_burger && translations.aria_burger[lang]) {
        burger.setAttribute('aria-label', translations.aria_burger[lang]);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && translations.aria_theme && translations.aria_theme[lang]) {
        themeToggle.setAttribute('aria-label', translations.aria_theme[lang]);
    }

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langText = langToggle.querySelector('.lang-toggle__text');
        if (langText) langText.textContent = lang.toUpperCase();
        if (translations.aria_lang && translations.aria_lang[lang]) {
            langToggle.setAttribute('aria-label', translations.aria_lang[lang]);
        }
    }
}
