export function initTyping(translations, getCurrentLang) {
    const typingElement = document.getElementById('typingText');
    let typingIndex = 0;
    const typingDelay = 40;
    let typingStarted = false;
    let typingTimeout = null;
    const typingSubtitle = typingElement ? typingElement.closest('.hero__subtitle') : null;

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

    function startTyping() {
        if (typingStarted) return;
        typingStarted = true;
        typeNextChar();
    }

    function typeNextChar() {
        const text = getTypingText();
        if (typingIndex < text.length) {
            typingElement.textContent = text.substring(0, typingIndex + 1);
            typingIndex++;
            typingTimeout = setTimeout(typeNextChar, typingDelay);
        }
    }

    function restartTyping() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        typingElement.textContent = '';
        typingIndex = 0;
        typingStarted = false;
        reserveTypingHeight();
        if (document.querySelector('.hero__subtitle.is-visible') || document.querySelector('.hero.animate-on-scroll.is-visible')) {
            setTimeout(startTyping, 300);
        }
    }

    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const delayMap = new Map();
        animatedElements.forEach((el, i) => delayMap.set(el, i % 6));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = delayMap.get(entry.target) || 0;
                        entry.target.style.transitionDelay = `${delay * 0.08}s`;
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);

                        if (entry.target.querySelector('#typingText')) {
                            if (!typingStarted) {
                                setTimeout(startTyping, 600);
                            }
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        animatedElements.forEach((el) => {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach((el) => {
            el.classList.add('is-visible');
        });
        startTyping();
    }

    return { restartTyping };
}
