import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBadgeDom, attachBadge, collapseBadge, expandBadge, updateBadgeCount, updateBadgeLanguage } from '../../../src/ee/achievements/badge.js';

describe('achievements/badge', () => {
    let t;

    beforeEach(() => {
        document.body.innerHTML = '';
        t = vi.fn((key) => key);
    });

    describe('createBadgeDom', () => {
        it('returns wrapper, collapseBtn and expandBtn', () => {
            const result = createBadgeDom(t, () => 5, 18);
            expect(result.wrapper).toBeInstanceOf(HTMLDivElement);
            expect(result.collapseBtn).toBeInstanceOf(HTMLButtonElement);
            expect(result.expandBtn).toBeInstanceOf(HTMLButtonElement);
        });

        it('creates wrapper with ee-ach-badge class', () => {
            const { wrapper } = createBadgeDom(t, () => 5, 18);
            expect(wrapper.className).toBe('ee-ach-badge');
        });

        it('shows counter with correct text', () => {
            const { wrapper } = createBadgeDom(t, () => 5, 18);
            const counter = wrapper.querySelector('.ee-ach-badge__counter');
            expect(counter.textContent).toBe('5/18');
        });

        it('calls t for label and button titles', () => {
            createBadgeDom(t, () => 5, 18);
            expect(t).toHaveBeenCalledWith('ee_ach_hunter_badge');
            expect(t).toHaveBeenCalledWith('ee_ach_badge_collapse');
            expect(t).toHaveBeenCalledWith('ee_ach_badge_expand');
        });

        it('creates content with label, counter and collapse button', () => {
            const { wrapper } = createBadgeDom(t, () => 5, 18);
            expect(wrapper.querySelector('.ee-ach-badge__content')).not.toBeNull();
            expect(wrapper.querySelector('.ee-ach-badge__label')).not.toBeNull();
            expect(wrapper.querySelector('.ee-ach-badge__counter')).not.toBeNull();
            expect(wrapper.querySelector('.ee-ach-badge__toggle')).not.toBeNull();
        });
    });

    describe('attachBadge', () => {
        it('returns null when footer not found', () => {
            const listeners = [];
            const listen = (target, event, handler) => listeners.push({ target, event, handler });
            const result = attachBadge(t, listen, () => 5, 18);
            expect(result).toBeNull();
        });

        it('appends badge to footer inner when present', () => {
            const footer = document.createElement('footer');
            footer.className = 'footer';
            const inner = document.createElement('div');
            inner.className = 'footer__inner';
            footer.appendChild(inner);
            document.body.appendChild(footer);
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            const result = attachBadge(t, listen, () => 5, 18);
            expect(result).not.toBeNull();
            expect(inner.querySelector('.ee-ach-badge')).not.toBeNull();
        });

        it('appends badge to footer when no inner', () => {
            const footer = document.createElement('footer');
            footer.className = 'footer';
            document.body.appendChild(footer);
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            const result = attachBadge(t, listen, () => 5, 18);
            expect(result).not.toBeNull();
            expect(footer.querySelector('.ee-ach-badge')).not.toBeNull();
        });

        it('collapses badge on collapse button click', () => {
            const footer = document.createElement('footer');
            footer.className = 'footer';
            document.body.appendChild(footer);
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            attachBadge(t, listen, () => 5, 18);
            const badge = document.querySelector('.ee-ach-badge');
            document.querySelector('.ee-ach-badge__toggle').click();
            expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(true);
        });

        it('expands badge on expand button click', () => {
            const footer = document.createElement('footer');
            footer.className = 'footer';
            document.body.appendChild(footer);
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            attachBadge(t, listen, () => 5, 18);
            document.querySelector('.ee-ach-badge__toggle').click();
            const badge = document.querySelector('.ee-ach-badge');
            document.querySelector('.ee-ach-badge__expand').click();
            expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(false);
        });
    });

    describe('collapseBadge', () => {
        it('adds collapsed class to badge', () => {
            const badge = document.createElement('div');
            badge.className = 'ee-ach-badge';
            collapseBadge(badge);
            expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(true);
        });

        it('does nothing when passed null', () => {
            expect(() => collapseBadge(null)).not.toThrow();
        });
    });

    describe('expandBadge', () => {
        it('removes collapsed class from badge', () => {
            const badge = document.createElement('div');
            badge.className = 'ee-ach-badge ee-ach-badge--collapsed';
            expandBadge(badge);
            expect(badge.classList.contains('ee-ach-badge--collapsed')).toBe(false);
        });

        it('does nothing when passed null', () => {
            expect(() => expandBadge(null)).not.toThrow();
        });
    });

    describe('updateBadgeCount', () => {
        it('updates counter text in badge', () => {
            const { wrapper } = createBadgeDom(t, () => 5, 18);
            updateBadgeCount(wrapper, () => 10, 18);
            const counter = wrapper.querySelector('.ee-ach-badge__counter');
            expect(counter.textContent).toBe('10/18');
        });

        it('does nothing when passed null', () => {
            expect(() => updateBadgeCount(null, () => 5, 18)).not.toThrow();
        });

        it('does nothing when counter element is missing', () => {
            const div = document.createElement('div');
            expect(() => updateBadgeCount(div, () => 5, 18)).not.toThrow();
        });
    });

    describe('updateBadgeLanguage', () => {
        it('updates label and button titles', () => {
            const { wrapper } = createBadgeDom(t, () => 5, 18);
            t.mockClear();
            updateBadgeLanguage(wrapper, t);
            expect(t).toHaveBeenCalledWith('ee_ach_hunter_badge');
            expect(t).toHaveBeenCalledWith('ee_ach_badge_collapse');
            expect(t).toHaveBeenCalledWith('ee_ach_badge_expand');
        });

        it('does nothing when passed null', () => {
            expect(() => updateBadgeLanguage(null, t)).not.toThrow();
        });
    });
});
