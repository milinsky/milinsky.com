import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDragResist } from '../../src/ee/drag-resist.js';

describe('drag-resist', () => {
    let eeManager;
    let t;
    let showToast;
    let destroyFn;

    beforeEach(() => {
        document.body.innerHTML = '';
        eeManager = { discover: vi.fn() };
        t = vi.fn((key) => {
            const map = {
                ee_drag_title: 'MILINSKY.OS -- Error',
                ee_drag_body: 'User attempted to move a system resource.\nError code: 0xC0FFEE',
                ee_drag_contact: 'Contact',
                ee_drag_resume: 'Resume',
                ee_drag_just: 'Just because',
                ee_drag_response: 'Continue, hooligan.',
            };
            return map[key] ?? key;
        });
        showToast = vi.fn();
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        vi.restoreAllMocks();
    });

    function init() {
        const result = createDragResist({ eeManager, t, showToast });
        destroyFn = result.destroy;
        return result;
    }

    function fireDragstart() {
        const event = new Event('dragstart', { bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        return event;
    }

    it('dragstart event shows CDE dialog', () => {
        init();
        fireDragstart();
        expect(document.querySelector('.ee-drag-modal')).not.toBeNull();
        expect(document.querySelector('.ee-modal-overlay')).not.toBeNull();
    });

    it('dialog has correct title text', () => {
        init();
        fireDragstart();
        const header = document.querySelector('.ee-drag-modal__header');
        expect(header.textContent).toBe('MILINSKY.OS -- Error');
    });

    it('dialog body contains error text', () => {
        init();
        fireDragstart();
        const body = document.querySelector('.ee-drag-modal__body');
        expect(body.textContent).toContain('User attempted to move a system resource.');
        expect(body.textContent).toContain('Error code: 0xC0FFEE');
    });

    it('3 buttons present and labeled correctly', () => {
        init();
        fireDragstart();
        const buttons = document.querySelectorAll('.ee-drag-modal__btn');
        expect(buttons.length).toBe(3);
        expect(buttons[0].textContent).toBe('Contact');
        expect(buttons[1].textContent).toBe('Resume');
        expect(buttons[2].textContent).toBe('Just because');
    });

    it('Contact button has mailto href', () => {
        init();
        fireDragstart();
        const contactBtn = document.querySelector('.ee-drag-modal__btn[href^="mailto:"]');
        expect(contactBtn).not.toBeNull();
        expect(contactBtn.href).toContain('mailto:hello@milinsky.dev');
    });

    it('Resume button calls window.print', () => {
        window.print = vi.fn();
        init();
        fireDragstart();
        const buttons = document.querySelectorAll('.ee-drag-modal__btn');
        buttons[1].click();
        expect(window.print).toHaveBeenCalled();
        expect(document.querySelector('.ee-drag-modal')).toBeNull();
    });

    it('Just because closes dialog and shows toast', () => {
        init();
        fireDragstart();
        const buttons = document.querySelectorAll('.ee-drag-modal__btn');
        buttons[2].click();
        expect(showToast).toHaveBeenCalledWith('Continue, hooligan.');
        expect(document.querySelector('.ee-drag-modal')).toBeNull();
    });

    it('discover ee13 is called once on first dragstart', () => {
        init();
        fireDragstart();
        expect(eeManager.discover).toHaveBeenCalledWith('ee13');
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('second dragstart does not call discover again', () => {
        init();
        fireDragstart();
        fireDragstart();
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('e.preventDefault is called on dragstart', () => {
        init();
        const event = new Event('dragstart', { bubbles: true, cancelable: true });
        const spy = vi.spyOn(event, 'preventDefault');
        document.body.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('destroy removes dragstart listener', () => {
        const { destroy } = init();
        destroy();
        eeManager.discover.mockClear();
        fireDragstart();
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('returns destroy function', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('clicking overlay background closes dialog', () => {
        init();
        fireDragstart();
        const overlay = document.querySelector('.ee-modal-overlay');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: overlay });
        overlay.dispatchEvent(clickEvent);
        expect(document.querySelector('.ee-drag-modal')).toBeNull();
    });

    it('Contact button click does not close dialog via overlay', () => {
        init();
        fireDragstart();
        const contactBtn = document.querySelector('.ee-drag-modal__btn[href^="mailto:"]');
        const spy = vi.spyOn(MouseEvent.prototype, 'stopPropagation');
        contactBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(spy).toHaveBeenCalled();
    });

    it('clicking inside modal does not close dialog', () => {
        init();
        fireDragstart();
        const modal = document.querySelector('.ee-drag-modal');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: modal });
        modal.dispatchEvent(clickEvent);
        expect(document.querySelector('.ee-drag-modal')).not.toBeNull();
    });
});
