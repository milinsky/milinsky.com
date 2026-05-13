export function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    const progressText = document.getElementById('scrollProgressText');

    if (progressBar && progressText) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
        }, { passive: true });
    }
}
