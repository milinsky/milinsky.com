import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runHireCommand } from '../../../src/ee/contact-terminal/hire-command.js';

describe('runHireCommand', () => {
    let shell, t, appended, lines, listenCalls, scheduleCalls;

    beforeEach(() => {
        shell = document.createElement('div');
        t = vi.fn((key) => key);
        appended = [];
        lines = [];
        listenCalls = [];
        scheduleCalls = [];
    });

    function appendLine(text, cls) {
        const el = document.createElement('div');
        el.textContent = text;
        if (cls) el.className = cls;
        lines.push(el);
        shell.appendChild(el);
        return el;
    }
    function appendElement(el) { appended.push(el); shell.appendChild(el); }
    function schedule(fn, delay) { scheduleCalls.push({ fn, delay }); }
    function listen(target, event, handler) {
        listenCalls.push({ target, event, handler });
        target.addEventListener(event, handler);
    }

    it('shows all 3 scanning steps instantly in reducedMotion', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(lines.length).toBe(3);
        expect(t).toHaveBeenCalledWith('contact_hire_step1');
        expect(t).toHaveBeenCalledWith('contact_hire_step2');
        expect(t).toHaveBeenCalledWith('contact_hire_step3');
    });

    it('shows contract box with COLLABORATION PROPOSAL', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        expect(box).toBeDefined();
        expect(box.textContent).toContain('COLLABORATION PROPOSAL');
    });

    it('shows contract box with translated status', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(t).toHaveBeenCalledWith('contact_hire_status');
        expect(t).toHaveBeenCalledWith('contact_hire_response');
        expect(t).toHaveBeenCalledWith('contact_hire_open');
        expect(t).toHaveBeenCalledWith('contact_hire_notopen');
    });

    it('shows email and telegram option buttons', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const opts = shell.querySelectorAll('.contact-hire__option');
        expect(opts.length).toBe(2);
        expect(opts[0].textContent).toBe('[e] Email');
        expect(opts[1].textContent).toBe('[t] Telegram');
    });

    it('email option has correct tabindex and role', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const opts = shell.querySelectorAll('.contact-hire__option');
        expect(opts[0].getAttribute('tabindex')).toBe('0');
        expect(opts[0].getAttribute('role')).toBe('button');
        expect(opts[1].getAttribute('tabindex')).toBe('0');
        expect(opts[1].getAttribute('role')).toBe('button');
    });

    it('click on email calls runMailComposer', () => {
        const runMail = vi.fn();
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, runMail);
        const email = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'click');
        email.handler();
        expect(runMail).toHaveBeenCalled();
    });

    it('click on telegram opens URL', () => {
        const openSpy = vi.fn();
        const orig = window.open;
        window.open = openSpy;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const tg = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'click');
        tg.handler();
        expect(openSpy).toHaveBeenCalledWith('https://t.me/milinsky', '_blank');
        window.open = orig;
    });

    it('Enter key on email calls runMailComposer', () => {
        const runMail = vi.fn();
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, runMail);
        const email = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'keydown');
        email.handler({ key: 'Enter' });
        expect(runMail).toHaveBeenCalled();
    });

    it('Enter key on telegram opens URL', () => {
        const openSpy = vi.fn();
        const orig = window.open;
        window.open = openSpy;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const tg = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'keydown');
        tg.handler({ key: 'Enter' });
        expect(openSpy).toHaveBeenCalledWith('https://t.me/milinsky', '_blank');
        window.open = orig;
    });

    it('animated mode shows first step immediately', () => {
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(lines.length).toBe(1);
        expect(t).toHaveBeenCalledWith('contact_hire_step1');
    });

    it('animated mode schedules next steps with 600ms delay', () => {
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(scheduleCalls.length).toBe(1);
        expect(scheduleCalls[0].delay).toBe(600);
    });

    it('animated mode steps through all 3 steps via schedule', () => {
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(lines.length).toBe(1);
        scheduleCalls[0].fn();
        expect(lines.length).toBe(2);
        scheduleCalls[1].fn();
        expect(lines.length).toBe(3);
    });

    it('animated mode builds confirm UI after last step', () => {
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        scheduleCalls[0].fn();
        scheduleCalls[1].fn();
        scheduleCalls[2].fn();
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        expect(box).toBeDefined();
    });

    it('stops stepping when destroyed during animated steps', () => {
        let destroyed = false;
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed, vi.fn());
        expect(lines.length).toBe(1);
        destroyed = true;
        scheduleCalls[0].fn();
        expect(lines.length).toBe(1);
    });

    it('does not build confirm UI when destroyed in reducedMotion', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => true, vi.fn());
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        expect(box).toBeUndefined();
    });

    it('does not process email response when destroyed', () => {
        const runMail = vi.fn();
        let destroyed = false;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => destroyed, runMail);
        destroyed = true;
        const email = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'click');
        email.handler();
        expect(runMail).not.toHaveBeenCalled();
    });

    it('does not process telegram response when destroyed', () => {
        const openSpy = vi.fn();
        const orig = window.open;
        window.open = openSpy;
        let destroyed = false;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => destroyed, vi.fn());
        destroyed = true;
        const tg = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'click');
        tg.handler();
        expect(openSpy).not.toHaveBeenCalled();
        window.open = orig;
    });

    it('options line has margin-top style', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const optionsLine = appended.find((el) => el.style.marginTop === 'var(--space-sm)');
        expect(optionsLine).toBeDefined();
    });

    it('separator between options has correct text', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const separator = shell.querySelector('.contact-hire__option + span:not(.contact-hire__option)');
        expect(separator).not.toBeNull();
    });

    it('contract box contains border characters', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        expect(box.textContent).toContain('┌');
        expect(box.textContent).toContain('┐');
        expect(box.textContent).toContain('└');
        expect(box.textContent).toContain('┘');
        expect(box.textContent).toContain('│');
    });

    it('contract box minimum width is 42 characters', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        const boxText = box.textContent;
        const firstLine = boxText.split('\n')[0];
        expect(firstLine.length).toBeGreaterThanOrEqual(44);
    });

    it('registers click and keydown listeners for both options', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const emailClick = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'click');
        const emailKey = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'keydown');
        const tgClick = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'click');
        const tgKey = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'keydown');
        expect(emailClick).toBeDefined();
        expect(emailKey).toBeDefined();
        expect(tgClick).toBeDefined();
        expect(tgKey).toBeDefined();
    });
});
