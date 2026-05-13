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

HTMLCanvasElement.prototype.getContext = vi.fn();
