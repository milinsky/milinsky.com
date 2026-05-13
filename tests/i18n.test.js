import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eeT, applyLanguage } from '../src/i18n.js';

const translations = {
    greeting: { en: 'Hello', ru: 'Привет' },
    farewell: { en: 'Goodbye' },
    meta_description: { en: 'Meta desc EN', ru: 'Мета описание RU' },
    og_description: { en: 'OG desc EN', ru: 'OG описание RU' },
    page_title: { en: 'Page Title EN', ru: 'Заголовок RU' },
    aria_burger: { en: 'Menu EN', ru: 'Меню RU' },
    aria_theme: { en: 'Toggle theme EN', ru: 'Переключить тему RU' },
    aria_lang: { en: 'Switch language EN', ru: 'Сменить язык RU' },
    html_content: { en: '<b>Bold</b>', ru: '<b>Жирный</b>' },
};

describe('eeT', () => {
    it('returns correct translation for en', () => {
        expect(eeT('greeting', translations, 'en')).toBe('Hello');
    });

    it('returns correct translation for ru', () => {
        expect(eeT('greeting', translations, 'ru')).toBe('Привет');
    });

    it('falls back to en if lang not found', () => {
        expect(eeT('farewell', translations, 'ru')).toBe('Goodbye');
    });

    it('falls back to key if key not found at all', () => {
        expect(eeT('nonexistent_key', translations, 'en')).toBe('nonexistent_key');
    });

    it('handles missing translations gracefully', () => {
        expect(eeT('greeting', {}, 'en')).toBe('greeting');
    });

    it('returns key when translations object is empty', () => {
        expect(eeT('anything', {}, 'ru')).toBe('anything');
    });
});

describe('applyLanguage', () => {
    let elements = [];

    function createElement(tag, attrs = {}) {
        const el = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            el.setAttribute(k, v);
        }
        document.body.appendChild(el);
        elements.push(el);
        return el;
    }

    beforeEach(() => {
        elements = [];
    });

    afterEach(() => {
        elements.forEach((el) => el.remove());
        elements = [];
        document.documentElement.removeAttribute('lang');
        document.title = '';
    });

    it('sets html lang attribute', () => {
        applyLanguage('ru', translations);
        expect(document.documentElement.getAttribute('lang')).toBe('ru');
    });

    it('updates elements with data-i18n attribute', () => {
        const el = createElement('span', { 'data-i18n': 'greeting' });
        applyLanguage('ru', translations);
        expect(el.textContent).toBe('Привет');
    });

    it('updates elements with data-i18n-html attribute', () => {
        const el = createElement('div', { 'data-i18n-html': 'html_content' });
        applyLanguage('ru', translations);
        expect(el.innerHTML).toBe('<b>Жирный</b>');
    });

    it('skips data-i18n element when translation missing for lang', () => {
        const el = createElement('span', { 'data-i18n': 'farewell' });
        el.textContent = 'original';
        applyLanguage('ru', translations);
        expect(el.textContent).toBe('original');
    });

    it('updates meta description', () => {
        const meta = createElement('meta', { name: 'description', content: '' });
        applyLanguage('ru', translations);
        expect(meta.getAttribute('content')).toBe('Мета описание RU');
    });

    it('does not crash when meta description element missing', () => {
        expect(() => applyLanguage('en', translations)).not.toThrow();
    });

    it('updates og:description', () => {
        const og = createElement('meta', { property: 'og:description', content: '' });
        applyLanguage('en', translations);
        expect(og.getAttribute('content')).toBe('OG desc EN');
    });

    it('updates document.title', () => {
        applyLanguage('ru', translations);
        expect(document.title).toBe('Заголовок RU');
    });

    it('updates burger aria-label', () => {
        const burger = createElement('button', { id: 'navBurger' });
        applyLanguage('en', translations);
        expect(burger.getAttribute('aria-label')).toBe('Menu EN');
    });

    it('updates theme toggle aria-label', () => {
        const toggle = createElement('button', { id: 'themeToggle' });
        applyLanguage('ru', translations);
        expect(toggle.getAttribute('aria-label')).toBe('Переключить тему RU');
    });

    it('updates lang toggle text and aria-label', () => {
        const langToggle = document.createElement('button');
        langToggle.id = 'langToggle';
        const textSpan = document.createElement('span');
        textSpan.classList.add('lang-toggle__text');
        langToggle.appendChild(textSpan);
        document.body.appendChild(langToggle);
        elements.push(langToggle);

        applyLanguage('ru', translations);
        expect(textSpan.textContent).toBe('RU');
        expect(langToggle.getAttribute('aria-label')).toBe('Сменить язык RU');
    });

    it('does not crash when langToggle missing', () => {
        expect(() => applyLanguage('en', translations)).not.toThrow();
    });

    it('does not crash when burger missing but translations present', () => {
        expect(() => applyLanguage('en', translations)).not.toThrow();
    });

    it('skips data-i18n-html element when translation missing for lang', () => {
        const el = createElement('div', { 'data-i18n-html': 'html_content' });
        el.innerHTML = 'original';
        applyLanguage('de', translations);
        expect(el.innerHTML).toBe('original');
    });

    it('skips langToggle aria when translation missing for lang', () => {
        const langToggle = document.createElement('button');
        langToggle.id = 'langToggle';
        const textSpan = document.createElement('span');
        textSpan.classList.add('lang-toggle__text');
        langToggle.appendChild(textSpan);
        document.body.appendChild(langToggle);
        elements.push(langToggle);

        const partialTranslations = { aria_lang: { en: 'Switch' } };
        applyLanguage('de', partialTranslations);
        expect(langToggle.getAttribute('aria-label')).toBeNull();
        expect(textSpan.textContent).toBe('DE');
    });
});
