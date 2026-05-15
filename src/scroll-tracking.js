/**
 * @module scroll-tracking
 */

const STATUS_VISIBLE_MS = 1300;
const SYSLOG_CHAR_DELAY_MIN_MS = 25;
const SYSLOG_CHAR_DELAY_RANGE_MS = 25;
const ACTIVE_NAV_THRESHOLD = 0.15;
const ACTIVE_NAV_ROOT_MARGIN = '-80px 0px -15% 0px';
const STATUS_THRESHOLD = 0.2;
const STATUS_ROOT_MARGIN = '-20% 0px -60% 0px';
const SYSLOG_THRESHOLD = 0.1;
const SECTION_MAP = { about: '0x1A2B', services: '0x3F7C', results: '0x5D9E', expertise: '0x8A21', contact: '0xC4F0' };

/**
 * Initialize scroll-based navigation highlighting, section status display, and syslog animation.
 * @returns {{ destroy: () => void }}
 */
export function initScrollTracking() {
    const sections = document.querySelectorAll('section[id]');
    const observers = [];
    const timeouts = [];
    const navAnchors = document.querySelectorAll('.nav__link');

    if (sections.length > 0 && navAnchors.length > 0) {
        const activeNavObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        for (const link of navAnchors) {
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('nav__link--active');
                            } else {
                                link.classList.remove('nav__link--active');
                            }
                        }
                    }
                }
            },
            { threshold: ACTIVE_NAV_THRESHOLD, rootMargin: ACTIVE_NAV_ROOT_MARGIN }
        );
        for (const section of sections) {
            activeNavObserver.observe(section);
        }
        observers.push(activeNavObserver);
    }

    const scrollStatusEl = document.getElementById('scrollStatus');
    let lastVisibleSection = '';

    if (scrollStatusEl && sections.length > 0) {
        const statusObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        if (id !== lastVisibleSection && SECTION_MAP[id]) {
                            lastVisibleSection = id;
                            const addr = SECTION_MAP[id];
                            while (scrollStatusEl.firstChild) scrollStatusEl.removeChild(scrollStatusEl.firstChild);
                            const line1 = document.createElement('div');
                            line1.textContent = `[SYS] LOAD MOD ${addr}.. OK`;
                            const line2 = document.createElement('div');
                            line2.textContent = `[IO] SEC \u2192 ${id}`;
                            scrollStatusEl.appendChild(line1);
                            scrollStatusEl.appendChild(line2);
                            scrollStatusEl.classList.remove('scroll-status--visible');
                            void scrollStatusEl.offsetWidth;
                            scrollStatusEl.classList.add('scroll-status--visible');
                            const hideTimeout = setTimeout(() => {
                                scrollStatusEl.classList.remove('scroll-status--visible');
                            }, STATUS_VISIBLE_MS);
                            timeouts.push(hideTimeout);
                        }
                    }
                }
            },
            { threshold: STATUS_THRESHOLD, rootMargin: STATUS_ROOT_MARGIN }
        );
        for (const section of sections) {
            statusObserver.observe(section);
        }
        observers.push(statusObserver);
    }

    const syslogText = document.getElementById('syslogText');
    const footer = document.querySelector('.footer');
    if (syslogText && footer) {
        const syslogStr = 'build: 2026.05 | mem: 64MB | uptime: 127d | pid: 0x3A7F';
        let syslogDone = false;
        const syslogObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !syslogDone) {
                        syslogDone = true;
                        syslogObserver.unobserve(footer);
                        let i = 0;
                        (function typeChar() {
                            if (i < syslogStr.length) {
                                syslogText.textContent += syslogStr[i];
                                i++;
                                const charTimeout = setTimeout(
                                    typeChar,
                                    SYSLOG_CHAR_DELAY_MIN_MS + Math.random() * SYSLOG_CHAR_DELAY_RANGE_MS
                                );
                                timeouts.push(charTimeout);
                            }
                        })();
                    }
                }
            },
            { threshold: SYSLOG_THRESHOLD }
        );
        syslogObserver.observe(footer);
        observers.push(syslogObserver);
    }

    return {
        destroy() {
            for (const obs of observers) obs.disconnect();
            for (const t of timeouts) clearTimeout(t);
        },
    };
}
