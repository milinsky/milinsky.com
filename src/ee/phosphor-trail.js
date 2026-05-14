const STAGE_1_PX = 5000;
const STAGE_2_PX = 10000;
const STAGE_3_PX = 20000;
const FADE_ALPHA = 0.12;
const CLEAR_DELAY_MS = 1500;

const MESSAGE_KEYS = ['ee_phosphor_10k_1', 'ee_phosphor_10k_2', 'ee_phosphor_10k_3'];

/**
 * EE-05: Phosphor Trail — canvas overlay tracks total mouse distance
 * and shows increasingly intense phosphor glow at thresholds.
 * @param {{ eeManager: object, t: function, showToast?: function, reducedMotion: boolean }} ctx
 * @returns {{ destroy(): void }}
 */
export function createPhosphorTrail(ctx) {
    const { eeManager, t, showToast, reducedMotion } = ctx;

    let destroyed = false;
    let discovered = false;
    const listeners = [];
    let rafId = null;
    let clearTimer = null;
    let totalDistance = 0;
    let lastX = null;
    let lastY = null;
    let lastMoveTime = 0;

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'ee-phosphor-canvas';
    document.body.appendChild(canvas);

    const canvasCtx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    listen(window, 'resize', resize);

    function onMouseMove(e) {
        if (destroyed) return;

        const x = e.clientX;
        const y = e.clientY;

        if (lastX !== null && lastY !== null) {
            const dx = x - lastX;
            const dy = y - lastY;
            totalDistance += Math.sqrt(dx * dx + dy * dy);

            if (!reducedMotion) {
                drawSegment(lastX, lastY, x, y);
            }
        }

        lastX = x;
        lastY = y;
        lastMoveTime = Date.now();
        scheduleClear();
        checkThresholds();
    }

    function drawSegment(x1, y1, x2, y2) {
        if (!canvasCtx) return;

        let alpha = 0;
        let width = 1;

        if (totalDistance >= STAGE_3_PX) {
            alpha = 0.8;
            width = 4;
        } else if (totalDistance >= STAGE_2_PX) {
            alpha = 0.5;
            width = 3;
        } else if (totalDistance >= STAGE_1_PX) {
            alpha = 0.3;
            width = 2;
        }

        if (alpha === 0) return;

        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.moveTo(x1, y1);
        canvasCtx.lineTo(x2, y2);
        canvasCtx.strokeStyle = '#33ff33';
        canvasCtx.lineWidth = width;
        canvasCtx.globalAlpha = alpha;
        canvasCtx.stroke();
        canvasCtx.restore();
    }

    function clearCanvas() {
        if (!canvasCtx) return;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function scheduleClear() {
        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
            if (!destroyed) {
                clearCanvas();
            }
        }, CLEAR_DELAY_MS);
    }

    function fadeLoop() {
        if (destroyed || !canvasCtx) return;

        const idle = Date.now() - lastMoveTime;
        if (idle > CLEAR_DELAY_MS) {
            clearCanvas();
        } else {
            canvasCtx.save();
            canvasCtx.globalCompositeOperation = 'destination-out';
            canvasCtx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.restore();
        }

        rafId = requestAnimationFrame(fadeLoop);
    }

    function checkThresholds() {
        if (totalDistance >= STAGE_3_PX && !discovered) {
            discovered = true;
            eeManager.discover('ee05');

            const seed = eeManager.getSessionSeed();
            const index = Math.floor(seed * MESSAGE_KEYS.length) % MESSAGE_KEYS.length;
            if (showToast) showToast(t(MESSAGE_KEYS[index]));
        }
    }

    if (!reducedMotion) {
        rafId = requestAnimationFrame(fadeLoop);
    }

    listen(document, 'mousemove', onMouseMove);

    return {
        destroy() {
            destroyed = true;
            if (clearTimer) clearTimeout(clearTimer);
            if (rafId) cancelAnimationFrame(rafId);
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
            if (canvas.parentNode) canvas.remove();
        },
    };
}
