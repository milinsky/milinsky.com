import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runNeofetchCard } from '../../../src/ee/contact-terminal/neofetch-card.js';

describe('runNeofetchCard', () => {
    let shell, t, scheduleCalls, appended, intervalCalls;

    beforeEach(() => {
        shell = document.createElement('div');
        t = vi.fn((key) => key);
        scheduleCalls = [];
        appended = [];
        intervalCalls = [];
    });

    function schedule(fn, delay) { scheduleCalls.push({ fn, delay }); }
    function appendElement(el) { appended.push(el); shell.appendChild(el); }
    function addInterval(fn, delay) { intervalCalls.push({ fn, delay }); }

    it('calls onDone callback via schedule after completion', () => {
        const onDone = vi.fn();
        runNeofetchCard(shell, t, false, schedule, appendElement, onDone, addInterval);
        expect(scheduleCalls.length).toBe(1);
        expect(scheduleCalls[0].delay).toBe(200);
        scheduleCalls[0].fn();
        expect(onDone).toHaveBeenCalled();
    });

    it('schedules onDone with delay 0 when reducedMotion is true', () => {
        const onDone = vi.fn();
        runNeofetchCard(shell, t, true, schedule, appendElement, onDone, addInterval);
        expect(scheduleCalls.length).toBe(1);
        expect(scheduleCalls[0].delay).toBe(0);
        scheduleCalls[0].fn();
        expect(onDone).toHaveBeenCalled();
    });

    it('schedules onDone with delay 200 when reducedMotion is false', () => {
        const onDone = vi.fn();
        runNeofetchCard(shell, t, false, schedule, appendElement, onDone, addInterval);
        expect(scheduleCalls[0].delay).toBe(200);
    });

    it('renders ASCII art grid element', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const grid = appended.find((el) => el.classList.contains('contact-nf__grid'));
        expect(grid).toBeDefined();
        const ascii = grid.querySelector('.contact-nf__ascii');
        expect(ascii).not.toBeNull();
        expect(ascii.textContent).toContain('██');
    });

    it('renders info header via t() translation', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const header = shell.querySelector('.contact-nf__header');
        expect(header).not.toBeNull();
        expect(t).toHaveBeenCalledWith('contact_nf_os');
    });

    it('renders all 8 info fields plus time field (9 keys total)', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const keys = shell.querySelectorAll('.contact-nf__key');
        expect(keys.length).toBe(9);
    });

    it('renders info values using t() for each field', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(t).toHaveBeenCalledWith('contact_nf_host');
        expect(t).toHaveBeenCalledWith('contact_nf_kernel');
        expect(t).toHaveBeenCalledWith('contact_nf_uptime');
        expect(t).toHaveBeenCalledWith('contact_nf_shell');
        expect(t).toHaveBeenCalledWith('contact_nf_mail');
        expect(t).toHaveBeenCalledWith('contact_nf_tg');
        expect(t).toHaveBeenCalledWith('contact_nf_tz');
        expect(t).toHaveBeenCalledWith('contact_nf_status');
    });

    it('renders hint line with translated text', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const hint = appended.find((el) => el.classList.contains('contact-nf__hint'));
        expect(hint).toBeDefined();
        expect(hint.textContent).toBe('> ' + t('contact_hint'));
        expect(t).toHaveBeenCalledWith('contact_hint');
    });

    it('registers interval for clock ticking at 1000ms', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(intervalCalls.length).toBe(1);
        expect(intervalCalls[0].delay).toBe(1000);
    });

    it('interval callback updates time value text', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const keys = shell.querySelectorAll('.contact-nf__key');
        const timeKey = [...keys].find((k) => k.textContent === 'Time: ');
        expect(timeKey).toBeDefined();
        const timeValue = timeKey.nextElementSibling;
        expect(timeValue.classList.contains('contact-nf__value')).toBe(true);
        const before = timeValue.textContent;
        intervalCalls[0].fn();
        expect(timeValue.textContent).not.toBe('');
    });

    it('time field has correct class structure', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const keys = shell.querySelectorAll('.contact-nf__key');
        const timeKey = [...keys].find((k) => k.textContent === 'Time: ');
        const timeValue = timeKey.nextElementSibling;
        const timeLine = timeKey.parentElement;
        expect(timeLine.querySelector('.contact-nf__key')).toBe(timeKey);
        expect(timeLine.querySelector('.contact-nf__value')).toBe(timeValue);
    });

    it('interval is captured for external cleanup (destroy)', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(intervalCalls.length).toBe(1);
        expect(typeof intervalCalls[0].fn).toBe('function');
    });

    it('grid contains exactly ASCII and info children', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const grid = appended.find((el) => el.classList.contains('contact-nf__grid'));
        expect(grid.querySelector('.contact-nf__ascii')).not.toBeNull();
        expect(grid.querySelector('.contact-nf__info')).not.toBeNull();
    });

    it('appends grid first then hint', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(appended[0].classList.contains('contact-nf__grid')).toBe(true);
        expect(appended[1].classList.contains('contact-nf__hint')).toBe(true);
    });

    it('info fields have correct key:value format', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const infoLines = shell.querySelectorAll('.contact-nf__info > div:not(.contact-nf__header)');
        for (const line of infoLines) {
            const keySpan = line.querySelector('.contact-nf__key');
            const valueSpan = line.querySelector('.contact-nf__value');
            if (keySpan) {
                expect(keySpan.textContent).toContain(': ');
                expect(valueSpan).not.toBeNull();
            }
        }
    });
});
