import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eeShowSolarizedDialog } from '../../src/ee/solarized.js';

describe('solarized', () => {
    let eeManager;
    let eeT;

    beforeEach(() => {
        document.body.innerHTML = '';
        eeManager = {
            discover: vi.fn(),
        };
        eeT = vi.fn((key) => {
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

    it('creates overlay with class ee-solarized-overlay', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const overlay = document.querySelector('.ee-solarized-overlay');
        expect(overlay).not.toBeNull();
    });

    it('calls discover with ee-solarized', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        expect(eeManager.discover).toHaveBeenCalledWith('ee-solarized');
    });

    it('shows 16 color swatches', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches.length).toBe(16);
    });

    it('close button removes overlay', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const closeBtn = document.querySelector('.ee-solarized-dialog__close');
        closeBtn.click();
        expect(document.querySelector('.ee-solarized-overlay')).toBeNull();
    });

    it('clicking overlay background removes it', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const overlay = document.querySelector('.ee-solarized-overlay');
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(document.querySelector('.ee-solarized-overlay')).toBeNull();
    });

    it('Yes button shows yes response', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[0].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Great taste!');
    });

    it('No button shows no response', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[1].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Your loss!');
    });

    it('What button shows what response', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const buttons = document.querySelectorAll('.ee-solarized-btn');
        buttons[2].click();
        const response = document.querySelector('.ee-solarized-response');
        expect(response.textContent).toBe('Google it!');
    });

    it('removes existing overlay if present', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const firstOverlay = document.querySelector('.ee-solarized-overlay');
        expect(firstOverlay).not.toBeNull();
        eeShowSolarizedDialog(eeManager, eeT);
        const overlays = document.querySelectorAll('.ee-solarized-overlay');
        expect(overlays.length).toBe(1);
    });

    it('swatches have correct background colors', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches[0].style.background).toBe('#002b36');
        expect(swatches[15].style.background).toBe('#859900');
    });

    it('swatches have title with name and hex', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const swatches = document.querySelectorAll('.ee-solarized-swatch');
        expect(swatches[0].title).toContain('base03');
        expect(swatches[0].title).toContain('#002b36');
    });

    it('dialog header contains title and close button', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const header = document.querySelector('.ee-solarized-dialog__header');
        expect(header).not.toBeNull();
        expect(header.querySelector('span').textContent).toBe('SOLARIZED');
        expect(header.querySelector('button').textContent).toBe('\u00D7');
    });

    it('dialog body contains text with translated content', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        const text = document.querySelector('.ee-solarized-dialog__text');
        expect(text.textContent).toBe('Do you like Solarized?');
    });

    it('calls eeT for all required keys', () => {
        eeShowSolarizedDialog(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_solar_text');
        expect(eeT).toHaveBeenCalledWith('ee_solar_yes');
        expect(eeT).toHaveBeenCalledWith('ee_solar_no');
        expect(eeT).toHaveBeenCalledWith('ee_solar_what');
    });
});
