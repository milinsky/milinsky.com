import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initTyping } from '../src/typing.js';

const translations = {
    hero_typing: {
        en: 'Hello World',
        ru: 'Привет Мир',
    },
};

function createTypingDOM() {
    document.body.innerHTML = '';
    const hero = document.createElement('div');
    hero.className = 'hero animate-on-scroll';

    const subtitle = document.createElement('div');
    subtitle.className = 'hero__subtitle';

    const typingSpan = document.createElement('span');
    typingSpan.id = 'typingText';

    subtitle.appendChild(typingSpan);
    hero.appendChild(subtitle);
    document.body.appendChild(hero);

    return { hero, subtitle, typingSpan };
}

let capturedObservers = [];
let OriginalIO;

function captureObservers() {
    capturedObservers = [];
    OriginalIO = globalThis.IntersectionObserver;

    const CapturingIO = class {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.elements = [];
            capturedObservers.push(this);
        }
        observe(el) { this.elements.push(el); }
        unobserve() {}
        disconnect() {}
    };

    Object.defineProperty(globalThis, 'IntersectionObserver', {
        value: CapturingIO,
        configurable: true,
        writable: true,
    });
}

function restoreIO() {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
        value: OriginalIO,
        configurable: true,
        writable: true,
    });
}

describe('initTyping', () => {
    let getCurrentLang;

    beforeEach(() => {
        vi.useFakeTimers();
        getCurrentLang = vi.fn(() => 'en');
        captureObservers();
    });

    afterEach(() => {
        restoreIO();
        vi.useRealTimers();
    });

    it('returns { restartTyping } object', () => {
        createTypingDOM();
        const result = initTyping(translations, getCurrentLang);
        expect(result).toHaveProperty('restartTyping');
        expect(typeof result.restartTyping).toBe('function');
    });

    it('reserves typing height on init by setting minHeight on subtitle', () => {
        const { subtitle } = createTypingDOM();
        initTyping(translations, getCurrentLang);
        expect(subtitle.style.minHeight).toBeTruthy();
    });

    it('starts typing when IntersectionObserver triggers with element containing #typingText', () => {
        const { hero, typingSpan } = createTypingDOM();
        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        expect(observer).toBeDefined();

        observer.callback([{ isIntersecting: true, target: hero }]);

        vi.advanceTimersByTime(700);

        expect(typingSpan.textContent.length).toBeGreaterThan(0);
    });

    it('types characters one by one with correct delay', () => {
        const { hero, typingSpan } = createTypingDOM();
        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(599);

        expect(typingSpan.textContent).toBe('');

        vi.advanceTimersByTime(1);
        expect(typingSpan.textContent).toBe('H');

        vi.advanceTimersByTime(40);
        expect(typingSpan.textContent).toBe('He');

        vi.advanceTimersByTime(40 * 3);
        expect(typingSpan.textContent).toBe('Hello');

        vi.advanceTimersByTime(40 * 6);
        expect(typingSpan.textContent).toBe('Hello World');
    });

    it('restartTyping clears content and resets', () => {
        const { hero, typingSpan } = createTypingDOM();
        const { restartTyping } = initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 5);

        expect(typingSpan.textContent.length).toBeGreaterThan(0);

        restartTyping();

        expect(typingSpan.textContent).toBe('');
    });

    it('restartTyping starts typing again if hero has is-visible class', () => {
        const { hero, typingSpan } = createTypingDOM();
        const { restartTyping } = initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 11);

        expect(typingSpan.textContent).toBe('Hello World');

        hero.classList.add('is-visible');
        restartTyping();

        expect(typingSpan.textContent).toBe('');

        vi.advanceTimersByTime(300 + 40 * 11);
        expect(typingSpan.textContent).toBe('Hello World');
    });

    it('restartTyping starts typing when hero__subtitle has is-visible', () => {
        const { hero, subtitle, typingSpan } = createTypingDOM();
        const { restartTyping } = initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 11);

        subtitle.classList.add('is-visible');
        restartTyping();

        expect(typingSpan.textContent).toBe('');

        vi.advanceTimersByTime(300 + 40 * 11);
        expect(typingSpan.textContent).toBe('Hello World');
    });

    it('restartTyping does NOT start typing when element is not visible', () => {
        const { hero, typingSpan } = createTypingDOM();
        const { restartTyping } = initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 11);

        hero.classList.remove('is-visible');
        restartTyping();

        vi.advanceTimersByTime(1000);
        expect(typingSpan.textContent).toBe('');
    });

    it('handles missing typingElement gracefully', () => {
        document.body.innerHTML = '';
        const hero = document.createElement('div');
        hero.className = 'hero animate-on-scroll';
        document.body.appendChild(hero);

        expect(() => initTyping(translations, getCurrentLang)).not.toThrow();
        const result = initTyping(translations, getCurrentLang);
        expect(result).toHaveProperty('restartTyping');
    });

    it('falls back to en when hero_typing translation missing for current lang', () => {
        const { hero, typingSpan } = createTypingDOM();
        getCurrentLang = vi.fn(() => 'de');

        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 11);

        expect(typingSpan.textContent).toBe('Hello World');
    });

    it('does not start typing twice when triggered multiple times', () => {
        const { hero, typingSpan } = createTypingDOM();
        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(599);

        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(1);

        expect(typingSpan.textContent).toBe('H');

        vi.advanceTimersByTime(40 * 10);
        expect(typingSpan.textContent).toBe('Hello World');
    });

    it('uses the current language from getCurrentLang', () => {
        const { hero, typingSpan } = createTypingDOM();
        getCurrentLang = vi.fn(() => 'ru');

        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 10);

        expect(typingSpan.textContent).toBe('Привет Мир');
    });

    it('restartTyping works when no typing timer is active', () => {
        const { hero, typingSpan } = createTypingDOM();
        const { restartTyping } = initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: true, target: hero }]);
        vi.advanceTimersByTime(600 + 40 * 11);

        expect(typingSpan.textContent).toBe('Hello World');

        hero.classList.add('is-visible');
        restartTyping();
        expect(typingSpan.textContent).toBe('');

        restartTyping();
        expect(typingSpan.textContent).toBe('');
    });

    it('ignores non-intersecting IntersectionObserver entries', () => {
        const { hero, typingSpan } = createTypingDOM();
        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];
        observer.callback([{ isIntersecting: false, target: hero }]);

        vi.advanceTimersByTime(1000);
        expect(typingSpan.textContent).toBe('');
        expect(hero.classList.contains('is-visible')).toBe(false);
    });

    it('does not call startTyping when entry does not contain typingText', () => {
        const hero = document.createElement('div');
        hero.className = 'hero animate-on-scroll';
        const otherEl = document.createElement('div');
        otherEl.className = 'other-element animate-on-scroll';
        document.body.appendChild(hero);
        document.body.appendChild(otherEl);

        initTyping(translations, getCurrentLang);

        const observer = capturedObservers[0];

        observer.callback([{ isIntersecting: true, target: otherEl }]);
        vi.advanceTimersByTime(700);

        expect(otherEl.classList.contains('is-visible')).toBe(true);
    });

    describe('when IntersectionObserver is not supported', () => {
        let savedIO;

        beforeEach(() => {
            savedIO = globalThis.IntersectionObserver;
            delete globalThis.IntersectionObserver;
        });

        afterEach(() => {
            globalThis.IntersectionObserver = savedIO;
        });

        it('adds is-visible class to all animated elements directly', () => {
            const { hero, typingSpan } = createTypingDOM();
            initTyping(translations, getCurrentLang);
            expect(hero.classList.contains('is-visible')).toBe(true);
        });

        it('starts typing immediately without IntersectionObserver', () => {
            const { typingSpan } = createTypingDOM();
            initTyping(translations, getCurrentLang);
            vi.advanceTimersByTime(40 * 11);
            expect(typingSpan.textContent).toBe('Hello World');
        });

        it('returns restartTyping without IntersectionObserver', () => {
            createTypingDOM();
            const result = initTyping(translations, getCurrentLang);
            expect(result).toHaveProperty('restartTyping');
            expect(typeof result.restartTyping).toBe('function');
        });
    });
});
