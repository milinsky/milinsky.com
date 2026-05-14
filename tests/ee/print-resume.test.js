import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPrintResume } from '../../src/ee/print-resume.js';

describe('print-resume', () => {
    let eeManager;
    let t;

    beforeEach(() => {
        document.body.innerHTML = '';
        window.print = vi.fn();
        eeManager = {
            discover: vi.fn(),
            isDiscovered: vi.fn().mockReturnValue(false),
        };
        t = vi.fn((key) => key);
    });

    afterEach(() => {
        delete window.print;
        vi.restoreAllMocks();
    });

    it('returns destroy and printResume functions', () => {
        const result = createPrintResume({ eeManager, t });
        expect(result.destroy).toBeTypeOf('function');
        expect(result.printResume).toBeTypeOf('function');
    });

    it('destroy does not throw', () => {
        const { destroy } = createPrintResume({ eeManager, t });
        expect(() => destroy()).not.toThrow();
    });

    it('calls eeManager.discover with ee12 on printResume', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(eeManager.discover).toHaveBeenCalledWith('ee12');
    });

    it('adds ee-printing class to body on printResume', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(document.body.classList.contains('ee-printing')).toBe(true);
    });

    it('creates ee-print-resume element in body', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(document.querySelector('.ee-print-resume')).not.toBeNull();
    });

    it('calls window.print', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(window.print).toHaveBeenCalled();
    });

    it('removes ee-printing class and resume div after afterprint event', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(document.body.classList.contains('ee-printing')).toBe(true);
        expect(document.querySelector('.ee-print-resume')).not.toBeNull();

        window.dispatchEvent(new Event('afterprint'));

        expect(document.body.classList.contains('ee-printing')).toBe(false);
        expect(document.querySelector('.ee-print-resume')).toBeNull();
    });

    it('does not call discover or print after destroy', () => {
        const { destroy, printResume } = createPrintResume({ eeManager, t });
        destroy();
        printResume();
        expect(eeManager.discover).not.toHaveBeenCalled();
        expect(window.print).not.toHaveBeenCalled();
    });

    it('resume element contains name MILINSKY', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        const nameEl = document.querySelector('.ee-print-resume__name');
        expect(nameEl).not.toBeNull();
        expect(nameEl.textContent).toBe('MILINSKY');
    });

    it('resume element contains headings', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        const headings = document.querySelectorAll('.ee-print-resume__heading');
        expect(headings.length).toBe(3);
    });

    it('resume element contains contact info', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        const contact = document.querySelector('.ee-print-resume__contact');
        expect(contact).not.toBeNull();
        expect(contact.textContent).toContain('hello@milinsky.com');
    });

    it('resume element contains footer', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        const footer = document.querySelector('.ee-print-resume__footer');
        expect(footer).not.toBeNull();
        expect(footer.textContent).toBe('ee_print_footer');
    });

    it('uses t function for translated content', () => {
        const { printResume } = createPrintResume({ eeManager, t });
        printResume();
        expect(t).toHaveBeenCalledWith('ee_print_role');
        expect(t).toHaveBeenCalledWith('ee_print_experience_heading');
        expect(t).toHaveBeenCalledWith('ee_print_services_heading');
        expect(t).toHaveBeenCalledWith('ee_print_results_heading');
    });

    it('page restored to original state after print dialog', () => {
        const { printResume } = createPrintResume({ eeManager, t });

        const originalChildren = document.body.children.length;
        printResume();

        expect(document.body.children.length).toBe(originalChildren + 1);

        window.dispatchEvent(new Event('afterprint'));

        expect(document.body.children.length).toBe(originalChildren);
        expect(document.body.classList.contains('ee-printing')).toBe(false);
    });
});
