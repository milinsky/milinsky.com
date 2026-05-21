import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runMailComposer } from '../../../src/ee/contact-terminal/mail-composer.js';
import * as sendMessageModule from '../../../src/ee/contact-terminal/send-message.js';

describe('runMailComposer', () => {
    let shell, t, appended, lines, listenCalls, scheduleCalls;

    beforeEach(() => {
        vi.useFakeTimers();
        shell = document.createElement('div');
        t = vi.fn((key) => key);
        appended = [];
        lines = [];
        listenCalls = [];
        scheduleCalls = [];
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
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

    it('returns early when destroyed on entry', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => true);
        expect(lines.length).toBe(0);
        expect(scheduleCalls.length).toBe(0);
    });

    it('creates opening secure channel line', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        expect(lines.length).toBe(1);
        expect(lines[0].textContent).toBe('> ' + t('contact_mail_opening'));
        expect(t).toHaveBeenCalledWith('contact_mail_opening');
    });

    it('creates UI with subject input field and cursor', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelector('.contact-mail__input');
        expect(input).not.toBeNull();
        expect(input.getAttribute('tabindex')).toBe('0');
        expect(input.getAttribute('role')).toBe('textbox');
        const cursor = shell.querySelector('.contact-cursor');
        expect(cursor).not.toBeNull();
    });

    it('creates field label for subject prompt', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const field = shell.querySelector('.contact-mail__field');
        expect(field).not.toBeNull();
        expect(t).toHaveBeenCalledWith('contact_mail_subject_prompt');
    });

    it('handles typing characters in subject input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'H' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'o' }));
        expect(input.textContent).toBe('Hello');
    });

    it('handles backspace in subject input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'B' }));
        expect(input.textContent).toBe('AB');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(input.textContent).toBe('A');
    });

    it('reducedMotion schedules subject prompt with delay 0', () => {
        runMailComposer(shell, t, true, schedule, appendLine, appendElement, listen, () => false);
        expect(scheduleCalls[0].delay).toBe(0);
    });

    it('non-reducedMotion schedules subject prompt with delay 400', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        expect(scheduleCalls[0].delay).toBe(400);
    });

    it('enter on subject moves to message prompt', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(scheduleCalls.length).toBe(2);
        scheduleCalls[1].fn();
        expect(t).toHaveBeenCalledWith('contact_mail_message_prompt');
        expect(t).toHaveBeenCalledWith('contact_mail_send_hint');
    });

    it('/send command triggers message send and shows success', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(sendMessageModule.sendMessage).toHaveBeenCalled();
        expect(shell.querySelector('.contact-mail__success')).not.toBeNull();
    });

    it('/send passes subject and body to sendMessage', async () => {
        const spy = vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const subjectInput = shell.querySelectorAll('.contact-mail__input')[0];
        for (const ch of 'My Subject') {
            subjectInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        subjectInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of 'Body text') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(spy).toHaveBeenCalledWith('My Subject', 'Body text');
    });

    it('/send on same line as message body extracts correctly', async () => {
        const spy = vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of 'Hello world/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(spy).toHaveBeenCalledWith('', 'Hello world');
    });

    it('/send with only /send sends empty body', async () => {
        const spy = vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(spy).toHaveBeenCalledWith('', '');
    });

    it('Escape key cancels the message composer', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(lines.some((l) => l.textContent.includes('Cancelled'))).toBe(true);
    });

    it('enter in message input adds newline when not /send', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(msgInput.textContent).toBe('a\n');
    });

    it('backspace in message input removes last character', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'y' }));
        expect(msgInput.textContent).toBe('xy');
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(msgInput.textContent).toBe('x');
    });

    it('shows sending message before API call', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(t).toHaveBeenCalledWith('contact_mail_sending');
    });

    it('shows error with mailto fallback on send failure', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(false);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(shell.querySelector('.contact-mail__error')).not.toBeNull();
        expect(shell.querySelector('a[href="mailto:hello@milinsky.com"]')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('contact_mail_error');
    });

    it('click on subject line focuses input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const line = shell.querySelector('.contact-mail__field').parentElement;
        const clickHandler = [...listenCalls].find((l) => l.target === line && l.event === 'click');
        expect(clickHandler).toBeDefined();
    });

    it('click on message line focuses input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const fields = shell.querySelectorAll('.contact-mail__field');
        const msgLine = fields[1].parentElement;
        const clickHandler = [...listenCalls].find((l) => l.target === msgLine && l.event === 'click');
        expect(clickHandler).toBeDefined();
    });

    it('does nothing when destroyed during promptSubject', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        destroyed = true;
        scheduleCalls[0].fn();
        expect(shell.querySelectorAll('.contact-mail__input').length).toBe(0);
    });

    it('does nothing when destroyed during promptMessage', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        destroyed = true;
        scheduleCalls[1].fn();
        expect(shell.querySelectorAll('.contact-mail__field').length).toBe(1);
    });

    it('does nothing when destroyed during keydown in subject', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        destroyed = true;
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(input.textContent).toBe('');
    });

    it('does nothing when destroyed during keydown in message', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        destroyed = true;
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(msgInput.textContent).toBe('');
    });

    it('cursor is removed from subject when entering subject', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        expect(shell.querySelector('.contact-cursor')).not.toBeNull();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(shell.querySelectorAll('.contact-cursor').length).toBe(0);
    });

    it('new cursor appears in message prompt after subject is confirmed', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        expect(shell.querySelectorAll('.contact-cursor').length).toBe(1);
    });

    it('cursor is removed on Escape in message input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(shell.querySelectorAll('.contact-cursor').length).toBe(0);
    });

    it('shows success confirmation with translated text', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(t).toHaveBeenCalledWith('contact_mail_success');
        const success = shell.querySelector('.contact-mail__success');
        expect(success).not.toBeNull();
        expect(success.textContent).toContain('✓');
    });

    it('ignores non-printable keys in subject input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
        expect(input.textContent).toBe('');
    });

    it('ignores non-printable keys in message input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
        expect(msgInput.textContent).toBe('');
    });

    it('click on destroyed subject line does nothing', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        const line = shell.querySelector('.contact-mail__field').parentElement;
        const clickHandler = [...listenCalls].find((l) => l.target === line && l.event === 'click');
        destroyed = true;
        expect(() => clickHandler.handler()).not.toThrow();
    });

    it('click on destroyed message line does nothing', () => {
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const fields = shell.querySelectorAll('.contact-mail__field');
        const msgLine = fields[1].parentElement;
        const clickHandler = [...listenCalls].find((l) => l.target === msgLine && l.event === 'click');
        destroyed = true;
        expect(() => clickHandler.handler()).not.toThrow();
    });

    it('handles destroyed state during handleSend', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        let destroyed = false;
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        destroyed = true;
        await vi.runAllTimersAsync();
        expect(shell.querySelector('.contact-mail__success')).toBeNull();
    });

    it('trailing whitespace before /send is trimmed', async () => {
        const spy = vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of 'Hello  /send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(spy).toHaveBeenCalledWith('', 'Hello');
    });

    it('mailto link has correct class and text', async () => {
        vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(false);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        const mailLink = shell.querySelector('a[href="mailto:hello@milinsky.com"]');
        expect(mailLink).not.toBeNull();
        expect(mailLink.classList.contains('contact-hire__option')).toBe(true);
        expect(mailLink.textContent).toBe('hello@milinsky.com');
    });
});
