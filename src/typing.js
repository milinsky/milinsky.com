/**
 * @module typing
 */

const TYPING_DELAY_MS = 40;
const RESTART_DELAY_MS = 300;
const TYPING_START_DELAY_MS = 600;
const OBSERVER_THRESHOLD = 0.1;
const OBSERVER_ROOT_MARGIN = '0px 0px -40px 0px';
const STAGGER_BATCH_SIZE = 6;
const STAGGER_STEP_MS = 0.08;

/**
 * Initialize the hero typing animation with intersection-observer-based visibility triggers.
 * @param {Object} translations - Translations map.
 * @param {function(): string} getCurrentLang - Function returning the current language code.
 * @returns {{ restartTyping: () => void, destroy: () => void }}
 */
export function initTyping(translations, getCurrentLang) {
    const typingElement = document.getElementById('typingText');
    let typingIndex = 0;
    let typingStarted = false;
    let typingTimeout = null;
    let startDelayTimeout = null;
    const typingSubtitle = typingElement ? typingElement.closest('.hero__subtitle') : null;
    let observer = null;
    let delayMap = new Map();

    function getTypingText() {
        const lang = getCurrentLang();
        if (translations.hero_typing && translations.hero_typing[lang]) {
            return translations.hero_typing[lang];
        }
        return translations.hero_typing.en;
    }

    function reserveTypingHeight() {
        if (!typingElement || !typingSubtitle) return;
        typingElement.textContent = getTypingText();
        const h = typingSubtitle.offsetHeight;
        typingSubtitle.style.minHeight = `${h}px`;
        typingElement.textContent = '';
    }

    reserveTypingHeight();

    function typeNextChar() {
        const text = getTypingText();
        if (typingIndex < text.length) {
            typingElement.textContent = text.substring(0, typingIndex + 1);
            typingIndex++;
            typingTimeout = setTimeout(typeNextChar, TYPING_DELAY_MS);
        }
    }

    function startTyping() {
        if (typingStarted) return;
        typingStarted = true;
        typeNextChar();
    }

    function resetSequence() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        typingElement.textContent = '';
        typingIndex = 0;
        typingStarted = false;
        reserveTypingHeight();
        if (
            document.querySelector('.hero__terminal-frame.is-visible') ||
            document.querySelector('.hero.animate-on-scroll.is-visible')
        ) {
            startDelayTimeout = setTimeout(startTyping, RESTART_DELAY_MS);
        }
    }

    function handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const delay = delayMap.get(entry.target) || 0;
                entry.target.style.transitionDelay = `${delay * STAGGER_STEP_MS}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);

                if (entry.target.querySelector('#typingText')) {
                    if (!typingStarted) {
                        startDelayTimeout = setTimeout(startTyping, TYPING_START_DELAY_MS);
                    }
                }
            }
        }
    }

    function buildStaggerMap(elements) {
        const map = new Map();
        let idx = 0;
        for (const el of elements) {
            map.set(el, idx % STAGGER_BATCH_SIZE);
            idx++;
        }
        return map;
    }

    function setupScrollObserver(animatedElements) {
        if (!('IntersectionObserver' in window)) {
            for (const el of animatedElements) {
                el.classList.add('is-visible');
            }
            startTyping();
            return;
        }

        delayMap = buildStaggerMap(animatedElements);

        observer = new IntersectionObserver(handleIntersection, {
            threshold: OBSERVER_THRESHOLD,
            rootMargin: OBSERVER_ROOT_MARGIN,
        });

        for (const el of animatedElements) {
            observer.observe(el);
        }
    }

    setupScrollObserver(document.querySelectorAll('.animate-on-scroll'));

    return {
        restartTyping: resetSequence,
        destroy() {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                typingTimeout = null;
            }
            if (startDelayTimeout) {
                clearTimeout(startDelayTimeout);
                startDelayTimeout = null;
            }
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        },
    };
}
