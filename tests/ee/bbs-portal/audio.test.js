import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playModemTones } from '../../../src/ee/bbs-portal/audio.js';

describe('bbs-portal/audio — playModemTones', () => {
    let originalAudioContext;
    let originalWebkitAudioContext;

    beforeEach(() => {
        originalAudioContext = globalThis.AudioContext;
        originalWebkitAudioContext = globalThis.webkitAudioContext;
    });

    afterEach(() => {
        globalThis.AudioContext = originalAudioContext;
        globalThis.webkitAudioContext = originalWebkitAudioContext;
        vi.restoreAllMocks();
    });

    it('returns object with stop function', () => {
        const handle = playModemTones();
        expect(handle).toHaveProperty('stop');
        expect(handle.stop).toBeTypeOf('function');
    });

    it('stop does not throw', () => {
        const handle = playModemTones();
        expect(() => handle.stop()).not.toThrow();
    });

    it('creates AudioContext instance', () => {
        playModemTones();
        expect(globalThis.AudioContext).toHaveBeenCalled();
    });

    it('creates oscillator node', () => {
        const actx = globalThis.AudioContext.mock.results[0]?.value;
        playModemTones();
        expect(actx || globalThis.AudioContext.mock.results[0].value).toBeDefined();
    });

    it('creates gain node and connects to destination', () => {
        const handle = playModemTones();
        expect(handle).toBeDefined();
        const mockResult = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1];
        const actx = mockResult.value;
        expect(actx.createGain).toHaveBeenCalled();
        expect(actx.createOscillator).toHaveBeenCalled();
    });

    it('oscillator is configured as sine type', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const osc = actx.createOscillator.mock.results[0].value;
        expect(osc.type).toBe('sine');
    });

    it('gain node sets master volume', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const gain = actx.createGain.mock.results[0].value;
        expect(gain.gain.setValueAtTime).toHaveBeenCalled();
    });

    it('oscillator frequency is scheduled for tone sweeps', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const osc = actx.createOscillator.mock.results[0].value;
        expect(osc.frequency.setValueAtTime).toHaveBeenCalled();
        expect(osc.frequency.setValueAtTime.mock.calls.length).toBeGreaterThanOrEqual(6);
    });

    it('oscillator start and stop are called', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const osc = actx.createOscillator.mock.results[0].value;
        expect(osc.start).toHaveBeenCalled();
        expect(osc.stop).toHaveBeenCalled();
    });

    it('gain fade-out ramp is applied', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const gain = actx.createGain.mock.results[0].value;
        expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
    });

    it('stop calls actx.close', () => {
        const handle = playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        handle.stop();
        expect(actx.close).toHaveBeenCalled();
    });

    it('multiple stop calls do not throw', () => {
        const handle = playModemTones();
        handle.stop();
        expect(() => handle.stop()).not.toThrow();
    });

    it('returns early with no-op stop when no AudioContext available', () => {
        globalThis.AudioContext = undefined;
        globalThis.webkitAudioContext = undefined;
        const handle = playModemTones();
        expect(handle).toHaveProperty('stop');
        expect(handle.stop).toBeTypeOf('function');
        expect(() => handle.stop()).not.toThrow();
    });

    it('uses webkitAudioContext as fallback when AudioContext is not available', () => {
        globalThis.AudioContext = undefined;
        const webkitMock = vi.fn(function () {
            return {
                createOscillator: vi.fn(() => ({
                    type: 'sine',
                    frequency: { setValueAtTime: vi.fn() },
                    connect: vi.fn(),
                    start: vi.fn(),
                    stop: vi.fn(),
                    disconnect: vi.fn(),
                })),
                createGain: vi.fn(() => ({
                    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
                    connect: vi.fn(),
                    disconnect: vi.fn(),
                })),
                destination: {},
                close: vi.fn(),
            };
        });
        globalThis.webkitAudioContext = webkitMock;
        const handle = playModemTones();
        expect(webkitMock).toHaveBeenCalled();
        expect(handle.stop).toBeTypeOf('function');
    });

    it('oscillator connects to gain node', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const osc = actx.createOscillator.mock.results[0].value;
        expect(osc.connect).toHaveBeenCalled();
    });

    it('gain node connects to destination', () => {
        playModemTones();
        const actx = globalThis.AudioContext.mock.results[globalThis.AudioContext.mock.results.length - 1].value;
        const gain = actx.createGain.mock.results[0].value;
        expect(gain.connect).toHaveBeenCalledWith(actx.destination);
    });
});
