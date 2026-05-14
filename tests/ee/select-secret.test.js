import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSelectSecret } from '../../src/ee/select-secret.js';

describe('select-secret', () => {
    let eeManager;
    let t;
    let originalGetSelection;

    beforeEach(() => {
        document.body.innerHTML = '';
        vi.useFakeTimers();

        eeManager = {
            discover: vi.fn(),
        };
        t = vi.fn((key) => `translated_${key}`);

        originalGetSelection = window.getSelection;
    });

    afterEach(() => {
        window.getSelection = originalGetSelection;
        vi.useRealTimers();
    });

    function createSecretElement(key) {
        const el = document.createElement('span');
        el.className = 'ee-secret-text';
        el.setAttribute('data-ee-key', key);
        document.body.appendChild(el);
        return el;
    }

    it('sets textContent on .ee-secret-text elements using data-ee-key', () => {
        createSecretElement('secret_key_1');
        createSecretElement('secret_key_2');

        createSelectSecret({ eeManager, t });

        const elements = document.querySelectorAll('.ee-secret-text');
        expect(elements[0].textContent).toBe('translated_secret_key_1');
        expect(elements[1].textContent).toBe('translated_secret_key_2');
    });

    it('skips elements without data-ee-key', () => {
        const el = document.createElement('span');
        el.className = 'ee-secret-text';
        el.textContent = 'original';
        document.body.appendChild(el);

        createSelectSecret({ eeManager, t });

        expect(el.textContent).toBe('original');
    });

    it('Ctrl+A triggers discovery check', () => {
        const secretEl = createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));
        vi.advanceTimersByTime(150);

        expect(eeManager.discover).toHaveBeenCalledWith('ee11');
    });

    it('mouseup triggers discovery check', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).toHaveBeenCalledWith('ee11');
    });

    it('touchend triggers discovery check', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new TouchEvent('touchend'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).toHaveBeenCalledWith('ee11');
    });

    it('does not double-discover', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);
        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('does not discover when selection does not contain secret text', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => false),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles missing selection gracefully', () => {
        createSecretElement('my_secret');
        window.getSelection = vi.fn(() => null);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles selection with zero rangeCount', () => {
        createSecretElement('my_secret');
        window.getSelection = vi.fn(() => ({ rangeCount: 0 }));

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('returns early if no .ee-secret-text elements exist', () => {
        document.body.innerHTML = '<div>nothing here</div>';
        expect(() => createSelectSecret({ eeManager, t })).not.toThrow();
    });

    it('Meta+A triggers discovery check on Mac', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true }));
        vi.advanceTimersByTime(150);

        expect(eeManager.discover).toHaveBeenCalledWith('ee11');
    });

    it('non-matching keydown does not trigger check', () => {
        createSecretElement('my_secret');
        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
        vi.advanceTimersByTime(150);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('keydown without modifier does not trigger check', () => {
        createSecretElement('my_secret');
        createSelectSecret({ eeManager, t });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        vi.advanceTimersByTime(150);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('returns destroy function that cleans up', () => {
        createSecretElement('my_secret');
        const { destroy } = createSelectSecret({ eeManager, t });
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('destroy stops pending scheduled checks', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        const { destroy } = createSelectSecret({ eeManager, t });

        document.dispatchEvent(new MouseEvent('mouseup'));

        destroy();

        const beforeDiscoverCount = eeManager.discover.mock.calls.length;
        vi.advanceTimersByTime(500);

        expect(eeManager.discover.mock.calls.length).toBe(beforeDiscoverCount);
    });

    it('shows updated poem text via t() for ee_select_1/2/3', () => {
        createSecretElement('ee_select_1');
        createSecretElement('ee_select_2');
        createSecretElement('ee_select_3');

        createSelectSecret({ eeManager, t });

        const elements = document.querySelectorAll('.ee-secret-text');
        expect(elements[0].textContent).toBe('translated_ee_select_1');
        expect(elements[1].textContent).toBe('translated_ee_select_2');
        expect(elements[2].textContent).toBe('translated_ee_select_3');
    });

    it('uses correct language when t switches locale', () => {
        const el1 = createSecretElement('ee_select_1');
        const el2 = createSecretElement('ee_select_2');
        const el3 = createSecretElement('ee_select_3');

        t = vi.fn((key) => {
            const ru = {
                ee_select_1: 'Ты нашёл невидимый текст. В раннем вебе',
                ee_select_2: 'мы прятали сообщения в font color=background.',
                ee_select_3: 'Кое-что никогда не меняется. Продолжай искать.',
            };
            return ru[key] ?? key;
        });

        createSelectSecret({ eeManager, t });

        expect(el1.textContent).toBe('Ты нашёл невидимый текст. В раннем вебе');
        expect(el2.textContent).toBe('мы прятали сообщения в font color=background.');
        expect(el3.textContent).toBe('Кое-что никогда не меняется. Продолжай искать.');
    });
});
