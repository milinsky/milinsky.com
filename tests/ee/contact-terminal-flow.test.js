import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runMailComposer } from '../../src/ee/contact-terminal/mail-composer.js';
import * as sendMessageModule from '../../src/ee/contact-terminal/send-message.js';

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
        const el = document.createElement('div'); el.textContent = text;
        if (cls) el.className = cls; lines.push(el); shell.appendChild(el); return el;
    }
    function appendElement(el) { appended.push(el); shell.appendChild(el); }
    function schedule(fn, delay) { scheduleCalls.push({ fn, delay }); }
    function listen(target, event, handler) { listenCalls.push({ target, event, handler }); target.addEventListener(event, handler); }

    it('shows opening secure channel message', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        expect(lines.length).toBe(1);
        expect(t).toHaveBeenCalledWith('contact_mail_opening');
    });

    it('renders subject prompt after delay', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        expect(scheduleCalls.length).toBe(1);
        scheduleCalls[0].fn();
        expect(shell.querySelector('.contact-mail__field')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('contact_mail_subject_prompt');
    });

    it('enter moves to message prompt', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(scheduleCalls.length).toBe(2);
        scheduleCalls[1].fn();
        expect(shell.querySelectorAll('.contact-mail__field').length).toBe(2);
        expect(t).toHaveBeenCalledWith('contact_mail_message_prompt');
    });

    it('/send triggers message send and shows success', async () => {
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

    it('/send after message body sends with correct body', async () => {
        const spy = vi.spyOn(sendMessageModule, 'sendMessage').mockResolvedValue(true);
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        for (const ch of 'Test subject') {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        for (const ch of 'Hello world') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        for (const ch of '/send') {
            msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await vi.runAllTimersAsync();
        expect(spy).toHaveBeenCalledWith('Test subject', 'Hello world');
    });

    it('escape cancels composer', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        scheduleCalls[1].fn();
        const msgInput = shell.querySelectorAll('.contact-mail__input')[1];
        msgInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(lines.some((l) => l.textContent.includes('Cancelled'))).toBe(true);
    });

    it('does nothing when destroyed on entry', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => true);
        expect(lines.length).toBe(0);
    });

    it('reducedMotion prompts immediately', () => {
        runMailComposer(shell, t, true, schedule, appendLine, appendElement, listen, () => false);
        expect(scheduleCalls[0].delay).toBe(0);
    });

    it('shows error on send failure with mailto fallback', async () => {
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
    });

    it('backspace removes char in subject input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const input = shell.querySelectorAll('.contact-mail__input')[0];
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'H' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
        expect(input.textContent).toBe('Hi');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(input.textContent).toBe('H');
    });

    it('enter in message adds newline when not /send', () => {
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

    it('click on line focuses input', () => {
        runMailComposer(shell, t, false, schedule, appendLine, appendElement, listen, () => false);
        scheduleCalls[0].fn();
        const line = shell.querySelector('.contact-mail__field').parentElement;
        const clickHandler = [...listenCalls].find((l) => l.target === line && l.event === 'click');
        expect(clickHandler).toBeDefined();
    });
});

describe('sendMessage', () => {
    let origFetch;

    beforeEach(() => {
        origFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = origFetch;
        vi.restoreAllMocks();
    });

    it('returns true on successful fetch', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        const result = await sendMessageModule.sendMessage('test subject', 'test body');
        expect(result).toBe(true);
    });

    it('returns false on failed fetch', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
        const result = await sendMessageModule.sendMessage('test', 'body');
        expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('network'));
        const result = await sendMessageModule.sendMessage('test', 'body');
        expect(result).toBe(false);
    });

    it('sends correct payload', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessageModule.sendMessage('subj', 'msg body');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://formspree.io/f/xqenrqwj',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: 'subj', message: 'msg body' }),
            },
        );
    });
});
