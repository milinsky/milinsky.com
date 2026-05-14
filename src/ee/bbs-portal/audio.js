const TONE_FREQ_LOW = 1200;
const TONE_FREQ_HIGH = 2400;
const TONE_DURATION_MS = 0.15;
const TONE_GAP_MS = 0.05;
const TONE_SWEEPS = 3;
const FADE_OUT_MS = 0.3;

/**
 * Generate modem dial tones using Web Audio API.
 * @returns {{ stop: () => void }}
 */
export function playModemTones() {
    const CtxClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!CtxClass) return { stop() {} };

    const actx = new CtxClass();
    const gain = actx.createGain();
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(0.15, actx.currentTime);

    const osc = actx.createOscillator();
    osc.type = 'sine';
    osc.connect(gain);

    const now = actx.currentTime;
    for (let i = 0; i < TONE_SWEEPS; i++) {
        const offset = now + i * (TONE_DURATION_MS + TONE_GAP_MS) * 2;
        osc.frequency.setValueAtTime(TONE_FREQ_LOW, offset);
        osc.frequency.setValueAtTime(TONE_FREQ_HIGH, offset + TONE_DURATION_MS);
    }

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + TONE_SWEEPS * (TONE_DURATION_MS + TONE_GAP_MS) * 2 + FADE_OUT_MS
    );

    osc.start(now);
    osc.stop(now + TONE_SWEEPS * (TONE_DURATION_MS + TONE_GAP_MS) * 2 + FADE_OUT_MS + 0.05);

    return {
        stop() {
            try {
                osc.stop();
            } catch (_e) {
                /* noop */
            }
            try {
                actx.close();
            } catch (_e) {
                /* noop */
            }
        },
    };
}
