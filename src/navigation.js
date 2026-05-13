export function initNavigation() {
    const burger = document.getElementById('navBurger');
    const navList = document.getElementById('navList');

    if (burger && navList) {
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

        burger.addEventListener('click', toggleMenu);

        const navLinks = navList.querySelectorAll('.nav__link');
        navLinks.forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (navList.classList.contains('open') && !navList.contains(e.target) && !burger.contains(e.target)) {
                closeMenu();
            }
        });
    }
}
