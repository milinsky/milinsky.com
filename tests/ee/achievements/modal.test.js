import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createModalDom, attachModal } from '../../../src/ee/achievements/modal.js';

describe('achievements/modal', () => {
    let t;

    beforeEach(() => {
        document.body.innerHTML = '';
        t = vi.fn((key) => key);
    });

    describe('createModalDom', () => {
        it('returns overlay and closeBtn', () => {
            const result = createModalDom(t);
            expect(result.overlay).toBeInstanceOf(HTMLDivElement);
            expect(result.closeBtn).toBeInstanceOf(HTMLButtonElement);
        });

        it('creates overlay with modal class', () => {
            const { overlay } = createModalDom(t);
            expect(overlay.className).toBe('ee-ach-modal-overlay');
            expect(overlay.querySelector('.ee-ach-modal')).not.toBeNull();
        });

        it('creates header with perfectionist title', () => {
            const { overlay } = createModalDom(t);
            const header = overlay.querySelector('.ee-ach-modal__header');
            expect(header).not.toBeNull();
            expect(t).toHaveBeenCalledWith('ee_ach_perfectionist');
        });

        it('creates body with text and link', () => {
            const { overlay } = createModalDom(t);
            const body = overlay.querySelector('.ee-ach-modal__body');
            expect(body).not.toBeNull();
            expect(overlay.querySelector('.ee-ach-modal__text')).not.toBeNull();
            expect(overlay.querySelector('.ee-ach-modal__link')).not.toBeNull();
        });

        it('creates link pointing to milinsky.dev', () => {
            const { overlay } = createModalDom(t);
            const link = overlay.querySelector('.ee-ach-modal__link');
            expect(link.href).toBe('https://milinsky.dev/');
        });

        it('calls t for modal text and link', () => {
            createModalDom(t);
            expect(t).toHaveBeenCalledWith('ee_ach_modal_text');
            expect(t).toHaveBeenCalledWith('ee_ach_modal_link');
            expect(t).toHaveBeenCalledWith('ee_ach_panel_close');
        });

        it('close button has correct class', () => {
            const { closeBtn } = createModalDom(t);
            expect(closeBtn.className).toBe('ee-ach-modal__close');
        });
    });

    describe('attachModal', () => {
        it('appends modal to body and returns overlay', () => {
            const onClose = vi.fn();
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            const overlay = attachModal(t, listen, onClose);
            expect(overlay).toBeInstanceOf(HTMLDivElement);
            expect(document.querySelector('.ee-ach-modal')).not.toBeNull();
        });

        it('removes modal and calls onClose on close button click', () => {
            const onClose = vi.fn();
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            attachModal(t, listen, onClose);
            expect(document.querySelector('.ee-ach-modal')).not.toBeNull();
            document.querySelector('.ee-ach-modal__close').click();
            expect(document.querySelector('.ee-ach-modal')).toBeNull();
            expect(onClose).toHaveBeenCalled();
        });
    });
});
