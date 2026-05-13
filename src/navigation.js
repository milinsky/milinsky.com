/**
 * @module navigation
 */

/**
 * Initialize mobile navigation burger menu and click-outside handling.
 * @returns {{ destroy: () => void }}
 */
export function initNavigation() {
    const burger = document.getElementById('navBurger');
    const navList = document.getElementById('navList');

    if (!burger || !navList) {
        return { destroy() {} };
    }

    function toggleMenu() {
        const isOpen = burger.classList.toggle('active');
        navList.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
        burger.classList.remove('active');
        navList.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function onDocumentClick(e) {
        if (navList.classList.contains('open') && !navList.contains(e.target) && !burger.contains(e.target)) {
            closeMenu();
        }
    }

    burger.addEventListener('click', toggleMenu);

    const navLinks = navList.querySelectorAll('.nav__link');
    for (const link of navLinks) {
        link.addEventListener('click', closeMenu);
    }

    document.addEventListener('click', onDocumentClick);

    return {
        destroy() {
            burger.removeEventListener('click', toggleMenu);
            for (const link of navLinks) {
                link.removeEventListener('click', closeMenu);
            }
            document.removeEventListener('click', onDocumentClick);
        },
    };
}
