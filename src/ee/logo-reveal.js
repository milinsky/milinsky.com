const TEASE_COUNT = 4;
const TEASE_DELAY_MS = 600;
const REST_DELAY_MS = 1800;
const MAX_TEASE_RANDOM_MS = 400;
const MAX_REST_RANDOM_MS = 3600;
const BLINK_OPACITY_OFF_MS = 40;
const BLINK_BASE_INTERVAL_MS = 80;
const BLINK_COUNT_MIN = 4;
const BLINK_COUNT_RANDOM = 2;
const GLITCH_DURATION_MS = 500;
const ASSEMBLY_BUFFER_MS = 300;
const DEGRADATION_MIN_MS = 30000;
const DEGRADATION_RANGE_MS = 270000;
const BROKEN_PAUSE_MIN_MS = 3000;
const BROKEN_PAUSE_RANGE_MS = 4000;
const DEGRADE_COUNT_MIN = 25;
const DEGRADE_COUNT_RANDOM = 16;
const RECOVERY_DELAY_MS = 200;
const BLINK_COMPLETE_DELAY_MS = 100;

/**
 * Animated pixel-by-pixel reveal of the ASCII logo with periodic degradation effects.
 * @param {{ reducedMotion?: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createLogoReveal(ctx) {
    const { reducedMotion } = ctx;

    const logoPre = document.querySelector('.nav__logo-ascii');
    if (!logoPre) return { destroy() {} };

    logoPre.removeAttribute('data-glitch');
    logoPre.style.removeProperty('--gd');
    logoPre.style.removeProperty('--gdur');
    logoPre.style.opacity = '1';

    const text = logoPre.textContent;
    let logoHtml = '';
    const pixelIndices = [];

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '#') {
            logoHtml += `<span class="nav__logo-pixel" data-pi="${pixelIndices.length}">#</span>`;
            pixelIndices.push(i);
        } else {
            logoHtml += text[i];
        }
    }

    logoPre.innerHTML = logoHtml;

    const pixels = logoPre.querySelectorAll('.nav__logo-pixel');
    if (pixels.length === 0) return { destroy() {} };

    const indices = [];
    for (let p = 0; p < pixels.length; p++) indices.push(p);

    for (let s = indices.length - 1; s > 0; s--) {
        const j = Math.floor(Math.random() * (s + 1));
        const tmp = indices[s];
        indices[s] = indices[j];
        indices[j] = tmp;
    }

    const teaseCount = Math.min(TEASE_COUNT, indices.length);
    const tease = indices.slice(0, teaseCount);
    const rest = indices.slice(teaseCount);

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

    if (reducedMotion) {
        return {
            destroy() {
                destroyed = true;
                for (const id of timers) clearTimeout(id);
            },
        };
    }

    function blinkSeries(onComplete) {
        if (!logoPre.isConnected) return;
        logoPre.style.animation = `glitch ${GLITCH_DURATION_MS}ms ease-in-out`;
        schedule(() => {
            if (!logoPre.isConnected) return;
            logoPre.style.animation = '';

            const blinkCount = BLINK_COUNT_MIN + Math.floor(Math.random() * BLINK_COUNT_RANDOM);
            for (let b = 0; b < blinkCount; b++) {
                schedule(() => {
                    if (!logoPre.isConnected) return;
                    logoPre.style.opacity = '0';
                    schedule(() => {
                        if (logoPre.isConnected) logoPre.style.opacity = '1';
                    }, BLINK_OPACITY_OFF_MS);
                }, b * BLINK_BASE_INTERVAL_MS);
            }

            schedule(
                () => {
                    if (onComplete) onComplete();
                },
                blinkCount * BLINK_BASE_INTERVAL_MS + BLINK_COMPLETE_DELAY_MS
            );
        }, GLITCH_DURATION_MS);
    }

    const assemblyDone = REST_DELAY_MS + MAX_REST_RANDOM_MS + ASSEMBLY_BUFFER_MS;

    schedule(() => {
        blinkSeries(() => {
            scheduleDegradation();
        });
    }, assemblyDone);

    function scheduleDegradation() {
        if (destroyed) return;
        const delay = DEGRADATION_MIN_MS + Math.random() * DEGRADATION_RANGE_MS;
        schedule(() => {
            if (destroyed) return;
            if (document.hidden) {
                scheduleDegradation();
                return;
            }
            runDegradation();
        }, delay);
    }

    function runDegradation() {
        if (destroyed || !logoPre.isConnected) return;

        const currentPixels = logoPre.querySelectorAll('.nav__logo-pixel');
        if (currentPixels.length === 0) return;

        const visiblePixels = [];
        for (const pixel of currentPixels) {
            if (pixel.classList.contains('nav__logo-pixel--visible')) {
                visiblePixels.push(pixel);
            }
        }

        if (visiblePixels.length === 0) {
            scheduleDegradation();
            return;
        }

        const degradeCount = Math.min(
            visiblePixels.length,
            DEGRADE_COUNT_MIN + Math.floor(Math.random() * DEGRADE_COUNT_RANDOM)
        );
        const regionStart = Math.floor(Math.random() * Math.max(1, visiblePixels.length - degradeCount));
        const toDegrade = visiblePixels.slice(regionStart, regionStart + degradeCount);

        blinkSeries(() => {
            for (const pixel of toDegrade) {
                if (pixel.isConnected) pixel.classList.remove('nav__logo-pixel--visible');
            }

            const brokenPause = BROKEN_PAUSE_MIN_MS + Math.random() * BROKEN_PAUSE_RANGE_MS;
            schedule(() => {
                if (!logoPre.isConnected) return;

                blinkSeries(() => {
                    for (const pixel of toDegrade) {
                        if (pixel.isConnected) pixel.classList.add('nav__logo-pixel--visible');
                    }
                    schedule(() => {
                        scheduleDegradation();
                    }, RECOVERY_DELAY_MS);
                });
            }, brokenPause);
        });
    }

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        },
    };
}
