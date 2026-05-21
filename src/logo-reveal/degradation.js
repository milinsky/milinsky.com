const GLITCH_DURATION_MS = 500;
const BLINK_OPACITY_OFF_MS = 40;
const BLINK_BASE_INTERVAL_MS = 80;
const BLINK_COUNT_MIN = 4;
const BLINK_COUNT_RANDOM = 2;
const BLINK_COMPLETE_DELAY_MS = 100;
const DEGRADATION_MIN_MS = 30000;
const DEGRADATION_RANGE_MS = 270000;
const DEGRADE_COUNT_MIN = 25;
const DEGRADE_COUNT_RANDOM = 16;
const BROKEN_PAUSE_MIN_MS = 3000;
const BROKEN_PAUSE_RANGE_MS = 4000;
const RECOVERY_DELAY_MS = 200;

export function blinkSeries(logoPre, schedule, onComplete) {
    if (!logoPre.isConnected) return;
    logoPre.style.animation = `glitch ${GLITCH_DURATION_MS}ms ease-in-out`;
    schedule(() => {
        if (!logoPre.isConnected) return;
        logoPre.style.animation = '';

        const blinkCount = BLINK_COUNT_MIN + Math.floor(Math.random() * BLINK_COUNT_RANDOM);
        const blinkDelays = Array.from({ length: blinkCount }, (_, i) => i * BLINK_BASE_INTERVAL_MS);
        for (const delay of blinkDelays) {
            schedule(() => {
                if (!logoPre.isConnected) return;
                logoPre.style.opacity = '0';
                schedule(() => {
                    if (logoPre.isConnected) logoPre.style.opacity = '1';
                }, BLINK_OPACITY_OFF_MS);
            }, delay);
        }

        schedule(
            () => {
                if (onComplete) onComplete();
            },
            blinkCount * BLINK_BASE_INTERVAL_MS + BLINK_COMPLETE_DELAY_MS
        );
    }, GLITCH_DURATION_MS);
}

function runDegradationCycle(logoPre, schedule, getDestroyed, reschedule) {
    if (getDestroyed() || !logoPre.isConnected) return;

    const currentPixels = logoPre.querySelectorAll('.nav__logo-pixel');
    if (currentPixels.length === 0) return;

    const visiblePixels = [];
    for (const pixel of currentPixels) {
        if (pixel.classList.contains('nav__logo-pixel--visible')) {
            visiblePixels.push(pixel);
        }
    }

    if (visiblePixels.length === 0) {
        reschedule();
        return;
    }

    const degradeCount = Math.min(
        visiblePixels.length,
        DEGRADE_COUNT_MIN + Math.floor(Math.random() * DEGRADE_COUNT_RANDOM)
    );
    const regionStart = Math.floor(Math.random() * Math.max(1, visiblePixels.length - degradeCount));
    const toDegrade = visiblePixels.slice(regionStart, regionStart + degradeCount);

    blinkSeries(logoPre, schedule, () => {
        for (const pixel of toDegrade) {
            if (pixel.isConnected) pixel.classList.remove('nav__logo-pixel--visible');
        }

        const brokenPause = BROKEN_PAUSE_MIN_MS + Math.random() * BROKEN_PAUSE_RANGE_MS;
        schedule(() => {
            if (!logoPre.isConnected) return;

            blinkSeries(logoPre, schedule, () => {
                for (const pixel of toDegrade) {
                    if (pixel.isConnected) pixel.classList.add('nav__logo-pixel--visible');
                }
                schedule(() => {
                    reschedule();
                }, RECOVERY_DELAY_MS);
            });
        }, brokenPause);
    });
}

export function startDegradation(logoPre, schedule, getDestroyed) {
    function scheduleDegradation() {
        if (getDestroyed()) return;
        const delay = DEGRADATION_MIN_MS + Math.random() * DEGRADATION_RANGE_MS;
        schedule(() => {
            if (getDestroyed()) return;
            if (document.hidden) {
                scheduleDegradation();
                return;
            }
            runDegradationCycle(logoPre, schedule, getDestroyed, scheduleDegradation);
        }, delay);
    }

    scheduleDegradation();
}
