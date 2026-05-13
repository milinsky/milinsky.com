export function initVisualEffects(sectionLabels) {
    const retroCards = document.querySelectorAll('.retro-card');
    for (let c = 0; c < retroCards.length; c++) {
        const scanline = document.createElement('span');
        scanline.className = 'card-scanline';
        scanline.setAttribute('aria-hidden', 'true');
        retroCards[c].appendChild(scanline);
    }

    const crtNoise = document.getElementById('crtNoise');
    if (crtNoise) {
        let noiseTimer = null;
        (function runNoise() {
            const delay = 3000 + Math.random() * 6000;
            noiseTimer = setTimeout(() => {
                if (document.hidden) {
                    noiseTimer = setTimeout(runNoise, 1000);
                    return;
                }
                crtNoise.style.top = `${Math.random() * 100}vh`;
                crtNoise.classList.remove('crt-noise--active');
                void crtNoise.offsetWidth;
                crtNoise.classList.add('crt-noise--active');
                setTimeout(() => {
                    crtNoise.classList.remove('crt-noise--active');
                }, 250);
                runNoise();
            }, delay);
        })();
    }

    if (sectionLabels.length > 0) {
        const labelOriginals = new Map();
        sectionLabels.forEach((label) => {
            labelOriginals.set(label, label.textContent);
        });
        const labelStatuses = ['[OK]', '[READY]', '[DONE]', '[PASS]'];
        (function rotateLabelStatus() {
            const delay = 4000 + Math.random() * 8000;
            setTimeout(() => {
                if (document.hidden) {
                    rotateLabelStatus();
                    return;
                }
                const idx = Math.floor(Math.random() * sectionLabels.length);
                const label = sectionLabels[idx];
                const original = labelOriginals.get(label);
                const status = labelStatuses[Math.floor(Math.random() * labelStatuses.length)];
                label.textContent = `${original} ${status}`;
                setTimeout(() => {
                    label.textContent = original;
                }, 800 + Math.random() * 600);
                rotateLabelStatus();
            }, delay);
        })();
    }
}
