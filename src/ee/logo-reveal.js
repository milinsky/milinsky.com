export function initLogoReveal() {
    const logoPre = document.querySelector('.nav__logo-ascii');
    if (!logoPre) return;
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
    const indices = [];
    for (let p = 0; p < pixels.length; p++) indices.push(p);

    for (let s = indices.length - 1; s > 0; s--) {
        const j = Math.floor(Math.random() * (s + 1));
        const tmp = indices[s];
        indices[s] = indices[j];
        indices[j] = tmp;
    }

    const tease = indices.slice(0, 4);
    const rest = indices.slice(4);

    setTimeout(() => {
        for (let t = 0; t < tease.length; t++) {
            const el = pixels[tease[t]];
            const delay = Math.random() * 400;
            setTimeout(() => { el.classList.add('nav__logo-pixel--visible'); }, delay);
        }
    }, 600);

    setTimeout(() => {
        for (let r = 0; r < rest.length; r++) {
            const el = pixels[rest[r]];
            const delay = Math.random() * 3600;
            setTimeout(() => { el.classList.add('nav__logo-pixel--visible'); }, delay);
        }
    }, 1800);
}
