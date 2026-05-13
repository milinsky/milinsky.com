export function initTheme(html, eeShowSolarizedDialog) {
    const storedTheme = localStorage.getItem('theme');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = darkModeQuery.matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
        themeToggle.addEventListener('dblclick', (e) => {
            e.preventDefault();
            eeShowSolarizedDialog();
        });
    }

    darkModeQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}
