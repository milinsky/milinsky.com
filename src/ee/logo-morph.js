export function initLogoMorph(eeManager, options) {
    const { logoPre, originalLogo, reducedMotion, showToast, t } = options;
    const logoLink = document.querySelector('.nav__logo');
    if (!logoLink || !logoPre) return;

    const altArts = [
        '     /\\\n    /  \\\n   | ** |\n   | PHP|\n   | ** |\n  /| .. |\\\n / +----+ \\',
        ' /\\_/\\\n( o.o )\n > ^ <\n/|   |\\\n(_|   |_)',
        '   ____\n  / _  \\\n | (_   |\n |  _)  |\n | |    |\n \\_____/',
        ' ________\n|  ____. |\n| |    | |\n| |____| |\n|________|\n   |  |',
        '   ____\n  |  _ \\\n  | | | |\n  | |_| |\n  |  _  /\n  |_| \\_\\'
    ];

    let clicks = [];
    let morphActive = false;
    logoLink.addEventListener('click', (e) => {
        if (morphActive) return;
        e.preventDefault();
        clicks.push(Date.now());
        if (clicks.length > 7) {
            clicks.shift();
        }
        if (clicks.length === 7) {
            const span = clicks[6] - clicks[0];
            if (span < 3500) {
                clicks = [];
                morphActive = true;
                eeManager.discover('ee03');
                if (reducedMotion) {
                    showToast(t('ee_logo_reduced'), 3000);
                    const artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                    logoPre.textContent = altArts[artIdx];
                    setTimeout(() => {
                        logoPre.textContent = originalLogo;
                        morphActive = false;
                    }, 3000);
                    return;
                }
                const overlay = document.createElement('div');
                overlay.className = 'ee-matrix-overlay';
                document.body.appendChild(overlay);
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
                const colCount = Math.floor(window.innerWidth / 20);
                for (let col = 0; col < colCount; col++) {
                    const colEl = document.createElement('div');
                    colEl.className = 'ee-matrix-col';
                    colEl.style.left = `${col * 20}px`;
                    let text = '';
                    const len = 10 + Math.floor(Math.random() * 20);
                    for (let ci = 0; ci < len; ci++) {
                        text += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    colEl.textContent = text;
                    colEl.style.animationDuration = `${1 + Math.random() * 2}s`;
                    colEl.style.animationDelay = `${Math.random() * 0.8}s`;
                    overlay.appendChild(colEl);
                }
                setTimeout(() => {
                    overlay.remove();
                    const artIdx = Math.floor(eeManager.getSessionSeed() * altArts.length);
                    logoPre.textContent = altArts[artIdx];
                    setTimeout(() => {
                        logoPre.textContent = originalLogo;
                        morphActive = false;
                    }, 3000);
                }, 2000);
            }
        }
    });
}
