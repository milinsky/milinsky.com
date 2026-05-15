import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createVisitCounter } from '../../src/ee/visit-counter.js';

describe('visit-counter', () => {
    let eeManager;
    let t;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';

        const frame = document.createElement('div');
        frame.className = 'hero__terminal-frame';
        const split = document.createElement('div');
        split.className = 'hero__split';
        const left = document.createElement('div');
        left.className = 'hero__split-left';
        const divider = document.createElement('div');
        divider.className = 'hero__split-divider';
        const right = document.createElement('div');
        right.className = 'hero__split-right';
        const shell = document.createElement('div');
        shell.className = 'hero__terminal-shell';
        right.appendChild(shell);
        split.appendChild(left);
        split.appendChild(divider);
        split.appendChild(right);
        frame.appendChild(split);
        document.body.appendChild(frame);

        eeManager = {
            getVisitCount: vi.fn(),
            isDiscovered: vi.fn().mockReturnValue(false),
            discover: vi.fn(),
        };
        t = vi.fn((key) => {
            const map = {
                ee_visit_2: 'Back again! Visit #N',
                ee_visit_5: 'Regular visitor! #N times',
                ee_visit_10: 'You really like this place!',
                ee_visit_20: 'Legendary! #N visits and counting',
            };
            return map[key] ?? key;
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns early if visitCount < 2', () => {
        eeManager.getVisitCount.mockReturnValue(1);
        createVisitCounter({ eeManager, t });
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('returns early if visitCount is 0', () => {
        eeManager.getVisitCount.mockReturnValue(0);
        createVisitCounter({ eeManager, t });
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('creates .ee-visit-msg element', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        createVisitCounter({ eeManager, t });
        expect(document.querySelector('.ee-visit-msg')).not.toBeNull();
    });

    it('uses correct message for 2-4 visits', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        createVisitCounter({ eeManager, t });
        expect(t).toHaveBeenCalledWith('ee_visit_2');
    });

    it('uses correct message for 5-9 visits', () => {
        eeManager.getVisitCount.mockReturnValue(7);
        createVisitCounter({ eeManager, t });
        expect(t).toHaveBeenCalledWith('ee_visit_5');
    });

    it('uses correct message for 10-19 visits', () => {
        eeManager.getVisitCount.mockReturnValue(15);
        createVisitCounter({ eeManager, t });
        expect(t).toHaveBeenCalledWith('ee_visit_10');
    });

    it('uses correct message for 20+ visits', () => {
        eeManager.getVisitCount.mockReturnValue(25);
        createVisitCounter({ eeManager, t });
        expect(t).toHaveBeenCalledWith('ee_visit_20');
    });

    it('replaces #N with visit count', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(5000);
        expect(msgEl.textContent).toContain('3');
    });

    it('types message character by character', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        const afterOne = msgEl.textContent.length;
        vi.advanceTimersByTime(50);
        const afterTwo = msgEl.textContent.length;
        expect(afterTwo).toBeGreaterThanOrEqual(afterOne);
    });

    it('completes full message after all timeouts', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('3');
    });

    it('returns early if no .hero__terminal-frame', () => {
        document.body.innerHTML = '';
        eeManager.getVisitCount.mockReturnValue(5);
        expect(() => createVisitCounter({ eeManager, t })).not.toThrow();
        expect(document.querySelector('.ee-visit-msg')).toBeNull();
    });

    it('appends message element to terminal frame', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        createVisitCounter({ eeManager, t });
        const frame = document.querySelector('.hero__terminal-frame');
        const msgEl = frame.querySelector('.ee-visit-msg');
        expect(msgEl).not.toBeNull();
    });

    it('replaces #N with visit count for 5-9 range', () => {
        eeManager.getVisitCount.mockReturnValue(7);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('7');
    });

    it('replaces #N with visit count for 20+ range', () => {
        eeManager.getVisitCount.mockReturnValue(42);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('42');
    });

    it('returns destroy function that cleans up', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        const { destroy } = createVisitCounter({ eeManager, t });
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('destroy stops typing mid-message', () => {
        eeManager.getVisitCount.mockReturnValue(3);
        const { destroy } = createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');

        vi.advanceTimersByTime(50);

        const textBeforeDestroy = msgEl.textContent;
        expect(textBeforeDestroy.length).toBeGreaterThan(0);

        destroy();

        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toBe(textBeforeDestroy);
    });

    it('returns early with destroy for visitCount < 2', () => {
        eeManager.getVisitCount.mockReturnValue(1);
        const { destroy } = createVisitCounter({ eeManager, t });
        expect(destroy).toBeTypeOf('function');
    });

    it('completes full typing for 10-visit milestone', () => {
        eeManager.getVisitCount.mockReturnValue(10);
        createVisitCounter({ eeManager, t });
        const msgEl = document.querySelector('.ee-visit-msg');
        vi.advanceTimersByTime(10000);
        expect(msgEl.textContent).toContain('You really like this place!');
    });

    it('calls eeManager.discover with ee16 on first message show', () => {
        eeManager.getVisitCount.mockReturnValue(2);
        createVisitCounter({ eeManager, t });
        expect(eeManager.discover).toHaveBeenCalledWith('ee16');
    });

    it('does not call discover if already discovered', () => {
        eeManager.isDiscovered.mockReturnValue(true);
        eeManager.getVisitCount.mockReturnValue(2);
        createVisitCounter({ eeManager, t });
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('creates .ee-visit-link when visitCount >= 10', () => {
        eeManager.getVisitCount.mockReturnValue(10);
        createVisitCounter({ eeManager, t });
        const link = document.querySelector('.ee-visit-link');
        expect(link).not.toBeNull();
        expect(link.href).toBe('mailto:hello@milinsky.com');
        expect(link.textContent).toBe('> direct_contact');
    });

    it('does not create .ee-visit-link when visitCount < 10', () => {
        eeManager.getVisitCount.mockReturnValue(9);
        createVisitCounter({ eeManager, t });
        expect(document.querySelector('.ee-visit-link')).toBeNull();
    });

    it('creates telegram link when visitCount >= 20', () => {
        eeManager.getVisitCount.mockReturnValue(20);
        createVisitCounter({ eeManager, t });
        const links = document.querySelectorAll('.ee-visit-link');
        expect(links.length).toBe(2);
        const telegramLink = links[1];
        expect(telegramLink.textContent).toBe('> Telegram: t.me/milinsky');
        expect(telegramLink.tagName).toBe('A');
        expect(telegramLink.href).toContain('t.me/milinsky');
    });

    it('does not create telegram link when visitCount < 20', () => {
        eeManager.getVisitCount.mockReturnValue(19);
        createVisitCounter({ eeManager, t });
        const links = document.querySelectorAll('.ee-visit-link');
        expect(links.length).toBe(1);
    });
});
