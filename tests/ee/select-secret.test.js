import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initSelectSecret } from '../../src/ee/select-secret.js';

describe('select-secret', () => {
    let eeManager;
    let eeT;
    let originalGetSelection;

    beforeEach(() => {
        document.body.innerHTML = '';
        vi.useFakeTimers();

        eeManager = {
            discover: vi.fn(),
        };
        eeT = vi.fn((key) => `translated_${key}`);

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

        initSelectSecret(eeManager, eeT);

        const elements = document.querySelectorAll('.ee-secret-text');
        expect(elements[0].textContent).toBe('translated_secret_key_1');
        expect(elements[1].textContent).toBe('translated_secret_key_2');
    });

    it('skips elements without data-ee-key', () => {
        const el = document.createElement('span');
        el.className = 'ee-secret-text';
        el.textContent = 'original';
        document.body.appendChild(el);

        initSelectSecret(eeManager, eeT);

        expect(el.textContent).toBe('original');
    });

    it('Ctrl+A triggers discovery check', () => {
        const secretEl = createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        initSelectSecret(eeManager, eeT);

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

        initSelectSecret(eeManager, eeT);

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

        initSelectSecret(eeManager, eeT);

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

        initSelectSecret(eeManager, eeT);

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

        initSelectSecret(eeManager, eeT);

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles missing selection gracefully', () => {
        createSecretElement('my_secret');
        window.getSelection = vi.fn(() => null);

        initSelectSecret(eeManager, eeT);

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles selection with zero rangeCount', () => {
        createSecretElement('my_secret');
        window.getSelection = vi.fn(() => ({ rangeCount: 0 }));

        initSelectSecret(eeManager, eeT);

        document.dispatchEvent(new MouseEvent('mouseup'));
        vi.advanceTimersByTime(250);

        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('returns early if no .ee-secret-text elements exist', () => {
        document.body.innerHTML = '<div>nothing here</div>';
        expect(() => initSelectSecret(eeManager, eeT)).not.toThrow();
    });

    it('Meta+A triggers discovery check on Mac', () => {
        createSecretElement('my_secret');

        const mockSelection = {
            rangeCount: 1,
            containsNode: vi.fn(() => true),
        };
        window.getSelection = vi.fn(() => mockSelection);

        initSelectSecret(eeManager, eeT);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true }));
        vi.advanceTimersByTime(150);

        expect(eeManager.discover).toHaveBeenCalledWith('ee11');
    });
});
