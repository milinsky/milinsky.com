import { blinkSeries, startDegradation } from './logo-reveal/degradation.js';

const TEASE_COUNT = 4;
const TEASE_DELAY_MS = 600;
const REST_DELAY_MS = 1800;
const MAX_TEASE_RANDOM_MS = 400;
const MAX_REST_RANDOM_MS = 3600;
const ASSEMBLY_BUFFER_MS = 300;

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

function parseLogoPixels(logoPre) {
    const text = logoPre.textContent;
    while (logoPre.firstChild) logoPre.removeChild(logoPre.firstChild);
    const fragment = document.createDocumentFragment();
    let textBuffer = '';
    let pixelCount = 0;
    for (const char of text) {
        if (char === '#') {
            if (textBuffer) {
                fragment.appendChild(document.createTextNode(textBuffer));
                textBuffer = '';
            }
            const span = document.createElement('span');
            span.className = 'nav__logo-pixel';
            span.setAttribute('data-pi', String(pixelCount));
            span.textContent = '#';
            fragment.appendChild(span);
            pixelCount++;
        } else {
            textBuffer += char;
        }
    }
    if (textBuffer) fragment.appendChild(document.createTextNode(textBuffer));
    logoPre.appendChild(fragment);
    return logoPre.querySelectorAll('.nav__logo-pixel');
}

function scheduleAssembly(pixels, indices, schedule) {
    const teaseCount = Math.min(TEASE_COUNT, indices.length);
    const tease = indices.slice(0, teaseCount);
    const rest = indices.slice(teaseCount);

    schedule(() => {
        for (const idx of tease) {
            const el = pixels[idx];
            if (!el || !el.isConnected) continue;
            const delay = Math.random() * MAX_TEASE_RANDOM_MS;
            schedule(() => {
                if (el && el.isConnected) el.classList.add('nav__logo-pixel--visible');
            }, delay);
        }
    }, TEASE_DELAY_MS);

    schedule(() => {
        for (const idx of rest) {
            const el = pixels[idx];
            if (!el || !el.isConnected) continue;
            const delay = Math.random() * MAX_REST_RANDOM_MS;
            schedule(() => {
                if (el && el.isConnected) el.classList.add('nav__logo-pixel--visible');
            }, delay);
        }
    }, REST_DELAY_MS);
}

export function createLogoReveal(ctx) {
    const { reducedMotion } = ctx;

    const logoPre = document.querySelector('.nav__logo-ascii');
    if (!logoPre) return { destroy() {} };

    logoPre.removeAttribute('data-glitch');
    logoPre.style.removeProperty('--gd');
    logoPre.style.removeProperty('--gdur');
    logoPre.style.opacity = '1';

    const pixels = parseLogoPixels(logoPre);
    if (pixels.length === 0) return { destroy() {} };

    const indices = shuffleArray(Array.from({ length: pixels.length }, (_, i) => i));

    const timers = [];
    let destroyed = false;

    function schedule(fn, delay) {
        if (destroyed) return null;
        const id = setTimeout(() => {
            if (!destroyed) fn();
        }, delay);
        timers.push(id);
        return id;
    }

    scheduleAssembly(pixels, indices, schedule);

    if (reducedMotion) {
        return {
            destroy() {
                destroyed = true;
                for (const id of timers) clearTimeout(id);
            },
        };
    }

    const assemblyDone = REST_DELAY_MS + MAX_REST_RANDOM_MS + ASSEMBLY_BUFFER_MS;
    schedule(() => {
        blinkSeries(logoPre, schedule, () => {
            startDegradation(logoPre, schedule, () => destroyed);
        });
    }, assemblyDone);

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        },
    };
}
