import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initNavigation } from '../src/navigation.js';

describe('initNavigation', () => {
    let burger;
    let navList;
    let links;

    beforeEach(() => {
        burger = document.createElement('button');
        burger.id = 'navBurger';
        document.body.appendChild(burger);

        navList = document.createElement('nav');
        navList.id = 'navList';
        links = [];
        for (let i = 0; i < 3; i++) {
            const link = document.createElement('a');
            link.classList.add('nav__link');
            link.href = '#';
            link.textContent = `Link ${i}`;
            navList.appendChild(link);
            links.push(link);
        }
        document.body.appendChild(navList);

        initNavigation();
    });

    afterEach(() => {
        burger.remove();
        navList.remove();
        document.body.style.overflow = '';
    });

    function clickBurger() {
        burger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    it('click on burger toggles active class on burger and open class on navList', () => {
        clickBurger();
        expect(burger.classList.contains('active')).toBe(true);
        expect(navList.classList.contains('open')).toBe(true);

        clickBurger();
        expect(burger.classList.contains('active')).toBe(false);
        expect(navList.classList.contains('open')).toBe(false);
    });

    it('click on burger sets aria-expanded', () => {
        clickBurger();
        expect(burger.getAttribute('aria-expanded')).toBe('true');

        clickBurger();
        expect(burger.getAttribute('aria-expanded')).toBe('false');
    });

    it('click on burger sets body overflow to hidden when opening', () => {
        clickBurger();
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('click on burger clears body overflow when closing', () => {
        clickBurger();
        clickBurger();
        expect(document.body.style.overflow).toBe('');
    });

    it('click on nav link closes menu', () => {
        clickBurger();
        expect(navList.classList.contains('open')).toBe(true);

        links[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(burger.classList.contains('active')).toBe(false);
        expect(navList.classList.contains('open')).toBe(false);
        expect(burger.getAttribute('aria-expanded')).toBe('false');
        expect(document.body.style.overflow).toBe('');
    });

    it('click outside menu closes menu', () => {
        clickBurger();
        expect(navList.classList.contains('open')).toBe(true);

        const outsideEl = document.createElement('div');
        document.body.appendChild(outsideEl);
        outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(burger.classList.contains('active')).toBe(false);
        expect(navList.classList.contains('open')).toBe(false);
        outsideEl.remove();
    });

    it('click on burger does not close menu from outside', () => {
        clickBurger();
        expect(navList.classList.contains('open')).toBe(true);
    });

    it('click on navList does not close menu', () => {
        clickBurger();
        navList.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(navList.classList.contains('open')).toBe(true);
    });

    it('does not crash when burger is absent', () => {
        burger.remove();
        navList.remove();
        expect(() => initNavigation()).not.toThrow();
    });

    it('returns destroy function that cleans up', () => {
        const { destroy } = initNavigation();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('returns destroy function when burger absent', () => {
        burger.remove();
        navList.remove();
        const { destroy } = initNavigation();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });
});
