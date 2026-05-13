export function initSelectSecret(eeManager, eeT) {
    const secretTexts = document.querySelectorAll('.ee-secret-text');
    if (secretTexts.length === 0) return;
    for (let si = 0; si < secretTexts.length; si++) {
        const key = secretTexts[si].getAttribute('data-ee-key');
        if (key) {
            secretTexts[si].textContent = eeT(key);
        }
    }
    let discovered = false;
    function checkSelection() {
        if (discovered) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        for (let i = 0; i < secretTexts.length; i++) {
            if (sel.containsNode(secretTexts[i], true)) {
                discovered = true;
                eeManager.discover('ee11');
                return;
            }
        }
    }
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            setTimeout(checkSelection, 100);
        }
    });
    document.addEventListener('mouseup', () => {
        setTimeout(checkSelection, 200);
    });
    document.addEventListener('touchend', () => {
        setTimeout(checkSelection, 200);
    });
}
