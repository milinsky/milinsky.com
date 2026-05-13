/**
 * @module scroll-progress
 */

/**
 * Initialize the scroll progress bar and percentage indicator.
 * @returns {{ destroy: () => void }}
 */
export function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    const progressText = document.getElementById('scrollProgressText');

    if (!progressBar || !progressText) {
        return { destroy() {} };
    }

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return {
        destroy() {
            window.removeEventListener('scroll', onScroll);
        },
    };
}
