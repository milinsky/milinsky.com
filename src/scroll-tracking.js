export function initScrollTracking(sections) {
    const navAnchors = document.querySelectorAll('.nav__link');
    if (sections.length > 0 && navAnchors.length > 0) {
        const activeNavObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach((link) => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('nav__link--active');
                        } else {
                            link.classList.remove('nav__link--active');
                        }
                    });
                }
            });
        }, { threshold: 0.15, rootMargin: '-80px 0px -15% 0px' });
        sections.forEach((section) => {
            activeNavObserver.observe(section);
        });
    }

    const scrollStatusEl = document.getElementById('scrollStatus');
    const sectionMap = { about: '0x1A2B', services: '0x3F7C', results: '0x5D9E', expertise: '0x8A21', contact: '0xC4F0' };
    let lastVisibleSection = '';

    if (scrollStatusEl && sections.length > 0) {
        const statusObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    if (id !== lastVisibleSection && sectionMap[id]) {
                        lastVisibleSection = id;
                        const addr = sectionMap[id];
                        scrollStatusEl.innerHTML = `[SYS] LOAD MOD ${addr}.. OK<br>[IO] SEC \u2192 ${id}`;
                        scrollStatusEl.classList.remove('scroll-status--visible');
                        void scrollStatusEl.offsetWidth;
                        scrollStatusEl.classList.add('scroll-status--visible');
                        setTimeout(() => {
                            scrollStatusEl.classList.remove('scroll-status--visible');
                        }, 1300);
                    }
                }
            });
        }, { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' });
        sections.forEach((section) => {
            statusObserver.observe(section);
        });
    }

    const syslogText = document.getElementById('syslogText');
    const footer = document.querySelector('.footer');
    if (syslogText && footer) {
        const syslogStr = 'build: 2026.05 | mem: 64MB | uptime: 127d | pid: 0x3A7F';
        let syslogDone = false;
        const syslogObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !syslogDone) {
                    syslogDone = true;
                    syslogObserver.unobserve(footer);
                    let i = 0;
                    (function typeChar() {
                        if (i < syslogStr.length) {
                            syslogText.textContent += syslogStr[i];
                            i++;
                            setTimeout(typeChar, 25 + Math.random() * 25);
                        }
                    })();
                }
            });
        }, { threshold: 0.1 });
        syslogObserver.observe(footer);
    }
}
