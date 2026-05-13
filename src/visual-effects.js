/**
 * @module visual-effects
 */

const NOISE_DELAY_MIN_MS = 3000;
const NOISE_DELAY_RANGE_MS = 6000;
const NOISE_VISIBILITY_MS = 250;
const NOISE_HIDDEN_RETRY_MS = 1000;
const LABEL_ROTATE_DELAY_MIN_MS = 4000;
const LABEL_ROTATE_DELAY_RANGE_MS = 8000;
const LABEL_STATUS_REVERT_MIN_MS = 800;
const LABEL_STATUS_REVERT_RANGE_MS = 600;
const LABEL_STATUSES = ['[OK]', '[READY]', '[DONE]', '[PASS]'];

/**
 * Initialize CRT visual effects: retro-card scanlines, CRT noise, and section label status rotation.
 * @param {NodeList} sectionLabels - Section label elements with data-section attribute.
 * @returns {{ destroy: () => void }}
 */
export function initVisualEffects(sectionLabels) {
    const allTimeouts = [];
    let noiseDestroyed = false;
    let labelDestroyed = false;

    const retroCards = document.querySelectorAll('.retro-card');
    for (let c = 0; c < retroCards.length; c++) {
        const scanline = document.createElement('span');
        scanline.className = 'card-scanline';
        scanline.setAttribute('aria-hidden', 'true');
        retroCards[c].appendChild(scanline);
    }

    const crtNoise = document.getElementById('crtNoise');
    if (crtNoise) {
        (function runNoise() {
            if (noiseDestroyed) return;
            const delay = NOISE_DELAY_MIN_MS + Math.random() * NOISE_DELAY_RANGE_MS;
            const t = setTimeout(() => {
                if (noiseDestroyed) return;
                if (document.hidden) {
                    const retry = setTimeout(runNoise, NOISE_HIDDEN_RETRY_MS);
                    allTimeouts.push(retry);
                    return;
                }
                crtNoise.style.top = `${Math.random() * 100}vh`;
                crtNoise.classList.remove('crt-noise--active');
                void crtNoise.offsetWidth;
                crtNoise.classList.add('crt-noise--active');
                const hideT = setTimeout(() => {
                    crtNoise.classList.remove('crt-noise--active');
                }, NOISE_VISIBILITY_MS);
                allTimeouts.push(hideT);
                runNoise();
            }, delay);
            allTimeouts.push(t);
        })();
    }

    if (sectionLabels.length > 0) {
        const labelOriginals = new Map();
        for (const label of sectionLabels) {
            labelOriginals.set(label, label.textContent);
        }
        (function rotateLabelStatus() {
            if (labelDestroyed) return;
            const delay = LABEL_ROTATE_DELAY_MIN_MS + Math.random() * LABEL_ROTATE_DELAY_RANGE_MS;
            const t = setTimeout(() => {
                if (labelDestroyed) return;
                if (document.hidden) {
                    rotateLabelStatus();
                    return;
                }
                const idx = Math.floor(Math.random() * sectionLabels.length);
                const label = sectionLabels[idx];
                const original = labelOriginals.get(label);
                const status = LABEL_STATUSES[Math.floor(Math.random() * LABEL_STATUSES.length)];
                label.textContent = `${original} ${status}`;
                const revertT = setTimeout(
                    () => {
                        label.textContent = original;
                    },
                    LABEL_STATUS_REVERT_MIN_MS + Math.random() * LABEL_STATUS_REVERT_RANGE_MS
                );
                allTimeouts.push(revertT);
                rotateLabelStatus();
            }, delay);
            allTimeouts.push(t);
        })();
    }

    return {
        destroy() {
            noiseDestroyed = true;
            labelDestroyed = true;
            for (const t of allTimeouts) clearTimeout(t);
        },
    };
}
