import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendMessage } from '../../../src/ee/contact-terminal/send-message.js';

describe('sendMessage', () => {
    let origFetch;

    beforeEach(() => {
        origFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = origFetch;
        vi.restoreAllMocks();
    });

    it('returns true on successful response', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        const result = await sendMessage('Test Subject', 'Test Body');
        expect(result).toBe(true);
    });

    it('returns false on non-ok response', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
        const result = await sendMessage('Test', 'Body');
        expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
        const result = await sendMessage('Test', 'Body');
        expect(result).toBe(false);
    });

    it('sends POST request to Formspree URL', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('Subject', 'Message');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://formspree.io/f/xqenrqwj',
            expect.objectContaining({ method: 'POST' }),
        );
    });

    it('sends JSON content type header', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('Subject', 'Message');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: { 'Content-Type': 'application/json' },
            }),
        );
    });

    it('sends correct payload with subject and message', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('My Subject', 'My Message Body');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({ subject: 'My Subject', message: 'My Message Body' }),
            }),
        );
    });

    it('sends empty subject when provided empty string', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('', 'Body text');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({ subject: '', message: 'Body text' }),
            }),
        );
    });

    it('sends empty body when provided empty string', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('Subject', '');
        expect(globalThis.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({ subject: 'Subject', message: '' }),
            }),
        );
    });

    it('handles fetch throwing TypeError', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
        const result = await sendMessage('Test', 'Body');
        expect(result).toBe(false);
    });

    it('calls fetch exactly once per invocation', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
        await sendMessage('A', 'B');
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
});
