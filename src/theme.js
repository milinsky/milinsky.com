/**
 * @module theme
 */

import { setState } from './state.js';

export function initTheme(html, eeShowSolarizedDialog) {
    const storedTheme = localStorage.getItem('theme');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = darkModeQuery.matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', initialTheme);

    const themeToggle = document.getElementById('themeToggle');

    function onThemeClick() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setState('theme', next);
    }

    function onThemeDblClick(e) {
        e.preventDefault();
        eeShowSolarizedDialog();
    }

    function onDarkModeChange(e) {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', onThemeClick);
        themeToggle.addEventListener('dblclick', onThemeDblClick);
    }

    darkModeQuery.addEventListener('change', onDarkModeChange);

    return {
        destroy() {
            if (themeToggle) {
                themeToggle.removeEventListener('click', onThemeClick);
                themeToggle.removeEventListener('dblclick', onThemeDblClick);
            }
            darkModeQuery.removeEventListener('change', onDarkModeChange);
        },
    };
}
