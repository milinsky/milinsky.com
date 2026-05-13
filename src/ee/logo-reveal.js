export function initLogoReveal(reducedMotion) {
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

    const teaseCount = Math.min(4, indices.length);
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
        for (let t = 0; t < tease.length; t++) {
            const el = pixels[tease[t]];
            if (!el || !el.isConnected) continue;
            const delay = Math.random() * 400;
            schedule(() => {
                if (el && el.isConnected) el.classList.add('nav__logo-pixel--visible');
            }, delay);
        }
    }, 600);

    schedule(() => {
        for (let r = 0; r < rest.length; r++) {
            const el = pixels[rest[r]];
            if (!el || !el.isConnected) continue;
            const delay = Math.random() * 3600;
            schedule(() => {
                if (el && el.isConnected) el.classList.add('nav__logo-pixel--visible');
            }, delay);
        }
    }, 1800);

    if (reducedMotion) {
        return {
            destroy() {
                destroyed = true;
                for (const id of timers) clearTimeout(id);
            }
        };
    }

    function blinkSeries(onComplete) {
        if (!logoPre.isConnected) return;
        logoPre.style.animation = 'glitch 0.5s ease-in-out';
        schedule(() => {
            if (!logoPre.isConnected) return;
            logoPre.style.animation = '';

            const blinkCount = 4 + Math.floor(Math.random() * 2);
            for (let b = 0; b < blinkCount; b++) {
                schedule(() => {
                    if (!logoPre.isConnected) return;
                    logoPre.style.opacity = '0';
                    schedule(() => {
                        if (logoPre.isConnected) logoPre.style.opacity = '1';
                    }, 40);
                }, b * 80);
            }

            schedule(() => {
                if (onComplete) onComplete();
            }, blinkCount * 80 + 100);
        }, 500);
    }

    const assemblyDone = 1800 + 3600 + 300;

    schedule(() => {
        blinkSeries(() => {
            scheduleDegradation();
        });
    }, assemblyDone);

    function scheduleDegradation() {
        if (destroyed) return;
        const delay = 30000 + Math.random() * 270000;
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
        for (let i = 0; i < currentPixels.length; i++) {
            if (currentPixels[i].classList.contains('nav__logo-pixel--visible')) {
                visiblePixels.push(currentPixels[i]);
            }
        }

        if (visiblePixels.length === 0) {
            scheduleDegradation();
            return;
        }

        const degradeCount = Math.min(visiblePixels.length, 25 + Math.floor(Math.random() * 16));
        const regionStart = Math.floor(Math.random() * Math.max(1, visiblePixels.length - degradeCount));
        const toDegrade = visiblePixels.slice(regionStart, regionStart + degradeCount);

        blinkSeries(() => {
            for (let i = 0; i < toDegrade.length; i++) {
                if (toDegrade[i].isConnected) toDegrade[i].classList.remove('nav__logo-pixel--visible');
            }

            const brokenPause = 3000 + Math.random() * 4000;
            schedule(() => {
                if (!logoPre.isConnected) return;

                blinkSeries(() => {
                    for (let i = 0; i < toDegrade.length; i++) {
                        if (toDegrade[i].isConnected) toDegrade[i].classList.add('nav__logo-pixel--visible');
                    }
                    schedule(() => {
                        scheduleDegradation();
                    }, 200);
                });
            }, brokenPause);
        });
    }

    return {
        destroy() {
            destroyed = true;
            for (const id of timers) clearTimeout(id);
        }
    };
}
