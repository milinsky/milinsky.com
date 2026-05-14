import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createOverscrollSecret } from '../../src/ee/overscroll-secret.js';

function setScrollAtBottom() {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
}

function createWheelEvent(deltaY) {
    return new WheelEvent('wheel', { deltaY, bubbles: true });
}

function createTouchEvent() {
    const event = new Event('touchmove', { bubbles: true });
    Object.defineProperty(event, 'touches', {
        value: [{ clientY: 100 }],
        configurable: true,
    });
    return event;
}

describe('overscroll-secret', () => {
    let eeManager;
    let t;
    let showToast;
    let instance;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        document.body.classList.remove('ee-secret-crack');
        eeManager = {
            discover: vi.fn(),
            getSessionSeed: vi.fn(() => 0.5),
        };
        t = vi.fn((key) => key);
        showToast = vi.fn();
        setScrollAtBottom();
    });

    afterEach(() => {
        if (instance) {
            instance.destroy();
            instance = null;
        }
        document.body.classList.remove('ee-secret-crack');
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function init(opts = {}) {
        instance = createOverscrollSecret({
            eeManager,
            t,
            showToast,
            reducedMotion: opts.reducedMotion ?? false,
        });
        return instance;
    }

    function fireWheelGestures(count) {
        for (let i = 0; i < count; i++) {
            vi.advanceTimersByTime(1600);
            window.dispatchEvent(createWheelEvent(100));
        }
    }

    function fireTouchGestures(count) {
        for (let i = 0; i < count; i++) {
            vi.advanceTimersByTime(1600);
            window.dispatchEvent(createTouchEvent());
        }
    }

    it('returns destroy function', () => {
        init();
        expect(instance.destroy).toBeTypeOf('function');
        expect(() => instance.destroy()).not.toThrow();
    });

    it('does not activate after 2 overscroll gestures', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(2);
        expect(eeManager.discover).not.toHaveBeenCalled();
        expect(document.querySelector('.ee-secret-sector')).toBeNull();
    });

    it('activates after 3 overscroll gestures', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(eeManager.discover).toHaveBeenCalledWith('ee22');
    });

    it('calls discover exactly once', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(6);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('creates hidden section in DOM on activation', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        const sector = document.querySelector('.ee-secret-sector');
        expect(sector).not.toBeNull();
        expect(sector.querySelector('.ee-secret-sector__label')).not.toBeNull();
        expect(sector.querySelector('.ee-secret-sector__title')).not.toBeNull();
        expect(sector.querySelector('.ee-secret-sector__content')).not.toBeNull();
    });

    it('creates close button in sector', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        const closeBtn = document.querySelector('.ee-secret-sector__close');
        expect(closeBtn).not.toBeNull();
        expect(closeBtn.textContent).toBe('×');
    });

    it('dismiss removes sector and resets state', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.querySelector('.ee-secret-sector')).not.toBeNull();
        document.querySelector('.ee-secret-sector__close').click();
        expect(document.querySelector('.ee-secret-sector')).toBeNull();
    });

    it('dismiss resets counter allowing re-discovery', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        document.querySelector('.ee-secret-sector__close').click();
        fireWheelGestures(3);
        expect(eeManager.discover).toHaveBeenCalledTimes(2);
    });

    it('adds crack class to body during animation', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(true);
    });

    it('removes crack class and shows sector after crack animation', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        vi.advanceTimersByTime(600);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(false);
        const sector = document.querySelector('.ee-secret-sector');
        expect(sector.classList.contains('ee-secret-sector--visible')).toBe(true);
    });

    it('shows toast with discovered message after animation', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        vi.advanceTimersByTime(600);
        expect(showToast).toHaveBeenCalledWith('ee_overscroll_discovered');
        expect(t).toHaveBeenCalledWith('ee_overscroll_discovered');
    });

    it('skips crack animation when reducedMotion is true', () => {
        init({ reducedMotion: true });
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(false);
        const sector = document.querySelector('.ee-secret-sector');
        expect(sector.classList.contains('ee-secret-sector--visible')).toBe(true);
        expect(showToast).toHaveBeenCalledWith('ee_overscroll_discovered');
    });

    it('does not activate when not at bottom of page', () => {
        init();
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 5000, configurable: true });
        fireWheelGestures(3);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('does not activate on upward scroll', () => {
        init();
        setScrollAtBottom();
        window.dispatchEvent(createWheelEvent(-100));
        window.dispatchEvent(createWheelEvent(-100));
        window.dispatchEvent(createWheelEvent(-100));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('cleans up on destroy', () => {
        init();
        instance.destroy();
        instance = null;
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('removes sector element on destroy', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.querySelector('.ee-secret-sector')).not.toBeNull();
        instance.destroy();
        instance = null;
        expect(document.querySelector('.ee-secret-sector')).toBeNull();
    });

    it('removes crack class on destroy', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(true);
        instance.destroy();
        instance = null;
        expect(document.body.classList.contains('ee-secret-crack')).toBe(false);
    });

    it('uses translation keys for content', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(t).toHaveBeenCalledWith('ee_overscroll_label');
        expect(t).toHaveBeenCalledWith('ee_overscroll_title');
        expect(t).toHaveBeenCalledWith('ee_overscroll_content');
    });

    it('works with touch events at bottom', () => {
        init();
        setScrollAtBottom();
        fireTouchGestures(3);
        expect(eeManager.discover).toHaveBeenCalledWith('ee22');
    });

    it('does not activate on touch when not at bottom', () => {
        init();
        Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 5000, configurable: true });
        fireTouchGestures(3);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('does not activate on touch event without touches', () => {
        init();
        setScrollAtBottom();
        const event = new Event('touchmove', { bubbles: true });
        Object.defineProperty(event, 'touches', { value: [], configurable: true });
        vi.advanceTimersByTime(1600);
        window.dispatchEvent(event);
        vi.advanceTimersByTime(1600);
        window.dispatchEvent(event);
        vi.advanceTimersByTime(1600);
        window.dispatchEvent(event);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('does not trigger schedule after destroy during crack animation', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(3);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(true);
        instance.destroy();
        instance = null;
        vi.advanceTimersByTime(600);
        expect(document.body.classList.contains('ee-secret-crack')).toBe(false);
    });

    it('does not activate on wheel with deltaY of zero', () => {
        init();
        setScrollAtBottom();
        window.dispatchEvent(createWheelEvent(0));
        window.dispatchEvent(createWheelEvent(0));
        window.dispatchEvent(createWheelEvent(0));
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('rapid events within gap count as single gesture', () => {
        init();
        setScrollAtBottom();
        for (let i = 0; i < 30; i++) {
            window.dispatchEvent(createWheelEvent(100));
        }
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('counter resets after gesture reset timeout', () => {
        init();
        setScrollAtBottom();
        fireWheelGestures(2);
        vi.advanceTimersByTime(5500);
        fireWheelGestures(2);
        expect(eeManager.discover).not.toHaveBeenCalled();
    });
});
