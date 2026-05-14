import { vi } from 'vitest';

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get _store() { return store; },
    };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const sessionStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        get _store() { return store; },
    };
})();

Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock });

Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    writable: true,
});

class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
        this.elements = [];
    }
    observe(el) { this.elements.push(el); }
    unobserve() {}
    disconnect() {}
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: MockIntersectionObserver,
});

globalThis.matchMedia = vi.fn((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
}));

/** CanvasRenderingContext2D mock for phosphor-trail EE-05 */
const canvasContextMock = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    canvas: { width: 800, height: 600 },
};

HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
    if (type === '2d') return canvasContextMock;
    return null;
});

/** Web Audio API mock for BBS portal EE-14 */
const audioContextMock = {
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
globalThis.AudioContext = vi.fn(function () {
    return audioContextMock;
});
globalThis.webkitAudioContext = vi.fn(function () {
    return audioContextMock;
});

/** DeviceMotionEvent mock for shake EE-21 */
globalThis.DeviceMotionEvent = vi.fn();
globalThis.DeviceMotionEvent.requestPermission = vi.fn(() => Promise.resolve('granted'));

/** HashChangeEvent mock for BBS portal and achievements */
globalThis.HashChangeEvent = vi.fn(function (type, props) {
    const event = new Event(type);
    event.oldURL = props?.oldURL || '';
    event.newURL = props?.newURL || '';
    return event;
});
