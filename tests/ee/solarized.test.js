import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSolarized } from '../../src/ee/solarized.js';

describe('solarized', () => {
    let eeManager;
    let t;

    beforeEach(() => {
        document.body.innerHTML = '';
        eeManager = {
            discover: vi.fn(),
        };
        t = vi.fn((key) => {
            const map = {
                ee_solar_text: 'Do you like Solarized?',
                ee_solar_yes: 'Yes',
                ee_solar_no: 'No',
                ee_solar_what: 'What?',
                ee_solar_resp_yes: 'Great taste!',
                ee_solar_resp_no: 'Your loss!',
                ee_solar_resp_what: 'Google it!',
            };
            return map[key] ?? key;
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns show and destroy functions', () => {
        const result = createSolarized({ eeManager, t });
        expect(result.show).toBeTypeOf('function');
        expect(result.destroy).toBeTypeOf('function');
    });

    it('show creates overlay with class ee-solarized-overlay', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const overlay = document.querySelector('.ee-solarized-overlay');
        expect(overlay).not.toBeNull();
    });

    it('show calls discover with ee-solarized', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        expect(eeManager.discover).toHaveBeenCalledWith('ee-solarized');
    });

    it('shows 16 color swatches', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches.length).toBe(16);
    });

    it('close button removes overlay', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const closeBtn = document.querySelector('.ee-solarized-dialog__close');
        closeBtn.click();
        expect(document.querySelector('.ee-solarized-overlay')).toBeNull();
    });

    it('clicking overlay background removes it', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const overlay = document.querySelector('.ee-solarized-overlay');
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(document.querySelector('.ee-solarized-overlay')).toBeNull();
    });

    it('Yes button shows yes response', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[0].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Great taste!');
    });

    it('No button shows no response', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[1].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Your loss!');
    });

    it('What button shows what response', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[2].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Google it!');
    });

    it('removes existing overlay if present', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const firstOverlay = document.querySelector('.ee-solarized-overlay');
        expect(firstOverlay).not.toBeNull();
        show();
        const overlays = document.querySelectorAll('.ee-solarized-overlay');
        expect(overlays.length).toBe(1);
    });

    it('swatches have correct background colors', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches[0].style.background).toBe('#002b36');
        expect(swatches[15].style.background).toBe('#859900');
    });

    it('swatches have title with name and hex', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches[0].title).toContain('base03');
        expect(swatches[0].title).toContain('#002b36');
    });

    it('dialog header contains title and close button', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const header = document.querySelector('.ee-solarized-dialog__header');
        expect(header).not.toBeNull();
        expect(header.querySelector('span').textContent).toBe('SOLARIZED');
        expect(header.querySelector('button').textContent).toBe('\u00D7');
    });

    it('dialog body contains text with translated content', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        const text = document.querySelector('.ee-solarized-dialog__text');
        expect(text.textContent).toBe('Do you like Solarized?');
    });

    it('calls t for all required keys', () => {
        const { show } = createSolarized({ eeManager, t });
        show();
        expect(t).toHaveBeenCalledWith('ee_solar_text');
        expect(t).toHaveBeenCalledWith('ee_solar_yes');
        expect(t).toHaveBeenCalledWith('ee_solar_no');
        expect(t).toHaveBeenCalledWith('ee_solar_what');
    });

    it('destroy does not throw', () => {
        const { show, destroy } = createSolarized({ eeManager, t });
        show();
        expect(() => destroy()).not.toThrow();
    });
});
