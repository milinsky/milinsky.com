import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAchievements, TOTAL_EE_COUNT, EE_IDS } from '../../src/ee/achievements.js';

function createMockEeManager(discovered = new Set()) {
    return {
        discover: vi.fn((id) => discovered.add(id)),
        isDiscovered: vi.fn((id) => discovered.has(id)),
        getSessionSeed: vi.fn().mockReturnValue(0.3),
    };
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    const inner = document.createElement('div');
    inner.className = 'footer__inner';
    footer.appendChild(inner);
    document.body.appendChild(footer);
    return footer;
}

describe('achievements', () => {
    let eeManager;
    let discovered;
    let t;
    let showToast;

    beforeEach(() => {
        document.body.innerHTML = '';
        window.location.hash = '';
        discovered = new Set();
        eeManager = createMockEeManager(discovered);
        t = vi.fn((key) => key);
        showToast = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('exports TOTAL_EE_COUNT constant', () => {
        expect(TOTAL_EE_COUNT).toBe(18);
    });

    it('exports EE_IDS array with correct length', () => {
        expect(EE_IDS).toHaveLength(TOTAL_EE_COUNT);
    });

    it('returns destroy function', () => {
        const { destroy } = createAchievements({ eeManager, t, showToast });
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('adds ee08 to discovered on init', () => {
        createAchievements({ eeManager, t, showToast });
        expect(discovered.has('ee08')).toBe(true);
    });

    it('does not show hunter badge with fewer than 5 discovered', () => {
        createFooter();
        discovered.add('ee08');
        discovered.add('ee01');
        discovered.add('ee02');
        discovered.add('ee03');
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-badge')).toBeNull();
    });

    it('shows hunter badge at 5 discovered', () => {
        createFooter();
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-badge')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('ee_ach_hunter_badge');
    });

    it('shows hunter badge via wrapped discover when reaching 5', () => {
        createFooter();
        discovered.add('ee08');
        createAchievements({ eeManager, t, showToast });

        for (const id of ['ee01', 'ee02', 'ee03', 'ee04']) {
            eeManager.discover(id);
        }
        expect(document.querySelector('.ee-ach-badge')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('ee_ach_hunter_badge');
    });

    it('does not show hunter badge twice', () => {
        createFooter();
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        const firstBadge = document.querySelector('.ee-ach-badge');
        eeManager.discover('ee06');
        const allBadges = document.querySelectorAll('.ee-ach-badge');
        expect(allBadges.length).toBe(1);
        expect(allBadges[0]).toBe(firstBadge);
    });

    it('badge counter updates on new discovery', () => {
        createFooter();
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        const counter = document.querySelector('.ee-ach-badge__counter');
        expect(counter.textContent).toBe('5/' + TOTAL_EE_COUNT);
        eeManager.discover('ee06');
        expect(counter.textContent).toBe('6/' + TOTAL_EE_COUNT);
    });

    it('badge collapses on toggle click', () => {
        createFooter();
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        const badge = document.querySelector('.ee-ach-badge');
        expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(false);
        document.querySelector('.ee-ach-badge__toggle').click();
        expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(true);
    });

    it('badge expands on expand button click', () => {
        createFooter();
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        document.querySelector('.ee-ach-badge__toggle').click();
        const badge = document.querySelector('.ee-ach-badge');
        expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(true);
        document.querySelector('.ee-ach-badge__expand').click();
        expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(false);
    });

    it('badge is not created without footer in DOM', () => {
        for (const id of ['ee08', 'ee01', 'ee02', 'ee03', 'ee04']) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-badge')).toBeNull();
    });

    it('shows perfectionist modal when all EEs discovered', () => {
        for (const id of EE_IDS) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-modal')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('ee_ach_perfectionist');
    });

    it('shows perfectionist modal via discover when reaching total', () => {
        discovered.add('ee08');
        createAchievements({ eeManager, t, showToast });
        showToast.mockClear();

        const remaining = EE_IDS.filter((id) => id !== 'ee08');
        for (let i = 0; i < remaining.length - 1; i++) {
            discovered.add(remaining[i]);
        }
        eeManager.discover(remaining[remaining.length - 1]);

        expect(document.querySelector('.ee-ach-modal')).not.toBeNull();
    });

    it('perfectionist modal contains text and link', () => {
        for (const id of EE_IDS) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-modal__text')).not.toBeNull();
        expect(document.querySelector('.ee-ach-modal__link')).not.toBeNull();
        expect(document.querySelector('.ee-ach-modal__close')).not.toBeNull();
    });

    it('closes perfectionist modal on close button click', () => {
        for (const id of EE_IDS) {
            discovered.add(id);
        }
        createAchievements({ eeManager, t, showToast });
        document.querySelector('.ee-ach-modal__close').click();
        expect(document.querySelector('.ee-ach-modal')).toBeNull();
    });

    it('shows panel when hash is #achievements', () => {
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-panel')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('ee_ach_panel_title');
    });

    it('panel shows all EE items with correct count', () => {
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        const items = document.querySelectorAll('.ee-ach-item');
        expect(items).toHaveLength(TOTAL_EE_COUNT);
    });

    it('panel shows found and locked items', () => {
        discovered.add('ee08');
        discovered.add('ee01');
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        const found = document.querySelectorAll('.ee-ach-item--found');
        const locked = document.querySelectorAll('.ee-ach-item--locked');
        expect(found.length).toBe(2);
        expect(locked.length).toBe(TOTAL_EE_COUNT - 2);
    });

    it('panel shows found count text', () => {
        discovered.add('ee08');
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        const counter = document.querySelector('.ee-ach-panel__count');
        expect(counter).not.toBeNull();
        expect(t).toHaveBeenCalledWith('ee_ach_found');
    });

    it('closes panel on close button click', () => {
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        document.querySelector('.ee-ach-panel__close').click();
        expect(document.querySelector('.ee-ach-panel')).toBeNull();
    });

    it('closes panel on overlay click', () => {
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        const overlay = document.querySelector('.ee-ach-panel-overlay');
        overlay.click();
        expect(document.querySelector('.ee-ach-panel')).toBeNull();
    });

    it('shows panel on hashchange to #achievements', () => {
        createAchievements({ eeManager, t, showToast });
        expect(document.querySelector('.ee-ach-panel')).toBeNull();
        window.location.hash = '#achievements';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        expect(document.querySelector('.ee-ach-panel')).not.toBeNull();
    });

    it('hides panel on hashchange away from #achievements', () => {
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        window.location.hash = '';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        expect(document.querySelector('.ee-ach-panel')).toBeNull();
    });

    it('destroy restores original discover', () => {
        const original = eeManager.discover;
        const { destroy } = createAchievements({ eeManager, t, showToast });
        destroy();
        expect(eeManager.discover).toBe(original);
    });

    it('destroy removes panel, modal and badge', () => {
        createFooter();
        for (const id of EE_IDS) {
            discovered.add(id);
        }
        window.location.hash = '#achievements';
        const { destroy } = createAchievements({ eeManager, t, showToast });
        destroy();
        expect(document.querySelector('.ee-ach-panel')).toBeNull();
        expect(document.querySelector('.ee-ach-modal')).toBeNull();
        expect(document.querySelector('.ee-ach-badge')).toBeNull();
    });

    it('destroy removes hashchange listener', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { destroy } = createAchievements({ eeManager, t, showToast });
        const handler = addSpy.mock.calls.find((c) => c[0] === 'hashchange')?.[1];
        expect(handler).toBeTypeOf('function');
        destroy();
        expect(removeSpy).toHaveBeenCalledWith('hashchange', handler);
        addSpy.mockRestore();
        removeSpy.mockRestore();
    });

    it('destroy stops triggering on new discoveries', () => {
        createFooter();
        const { destroy } = createAchievements({ eeManager, t, showToast });
        destroy();
        t.mockClear();

        for (const id of EE_IDS) {
            eeManager.discover(id);
        }
        expect(document.querySelector('.ee-ach-badge')).toBeNull();
    });

    it('ee-solarized ID has correct translation key', () => {
        discovered.add('ee08');
        window.location.hash = '#achievements';
        createAchievements({ eeManager, t, showToast });
        expect(t).toHaveBeenCalledWith('ee_ach_name_ee_solarized');
    });
});
