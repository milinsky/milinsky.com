import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDailyPassword, formatSessionId } from '../../../src/ee/terminal-parser/utils.js';

describe('terminal-parser/utils — getDailyPassword', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns a non-empty string', () => {
        const pw = getDailyPassword();
        expect(pw).toBeTypeOf('string');
        expect(pw.length).toBeGreaterThan(0);
    });

    it('is deterministic for the same day', () => {
        const pw1 = getDailyPassword();
        const pw2 = getDailyPassword();
        expect(pw1).toBe(pw2);
    });

    it('is deterministic when called multiple times', () => {
        const passwords = Array.from({ length: 10 }, () => getDailyPassword());
        const unique = new Set(passwords);
        expect(unique.size).toBe(1);
    });

    it('produces different passwords for different days', () => {
        vi.setSystemTime(new Date('2025-01-15T12:00:00'));
        const pw1 = getDailyPassword();

        vi.setSystemTime(new Date('2025-01-16T12:00:00'));
        const pw2 = getDailyPassword();

        expect(pw1).not.toBe(pw2);
    });

    it('produces different passwords for dates months apart', () => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00'));
        const pw1 = getDailyPassword();

        vi.setSystemTime(new Date('2025-06-15T00:00:00'));
        const pw2 = getDailyPassword();

        expect(pw1).not.toBe(pw2);
    });

    it('same calendar day at different times gives same password', () => {
        vi.setSystemTime(new Date('2025-03-20T01:00:00'));
        const pw1 = getDailyPassword();

        vi.setSystemTime(new Date('2025-03-20T23:59:59'));
        const pw2 = getDailyPassword();

        expect(pw1).toBe(pw2);
    });

    it('starts with a NATO phonetic word', () => {
        const natoWords = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
        const pw = getDailyPassword();
        const startsWithNato = natoWords.some((word) => pw.startsWith(word));
        expect(startsWithNato).toBe(true);
    });

    it('contains numeric suffix after word', () => {
        const pw = getDailyPassword();
        const natoWords = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
        for (const word of natoWords) {
            if (pw.startsWith(word)) {
                const suffix = pw.slice(word.length);
                expect(suffix.length).toBeGreaterThan(0);
                expect(Number.isNaN(Number(suffix))).toBe(false);
                break;
            }
        }
    });

    it('numeric suffix is 0-999 range', () => {
        const passwords = [];
        for (let day = 1; day <= 30; day++) {
            vi.setSystemTime(new Date(`2025-01-${String(day).padStart(2, '0')}T12:00:00`));
            passwords.push(getDailyPassword());
        }
        const natoWords = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
        for (const pw of passwords) {
            for (const word of natoWords) {
                if (pw.startsWith(word)) {
                    const num = Number(pw.slice(word.length));
                    expect(num).toBeGreaterThanOrEqual(0);
                    expect(num).toBeLessThan(1000);
                    break;
                }
            }
        }
    });
});

describe('terminal-parser/utils — formatSessionId', () => {
    it('returns a string', () => {
        const id = formatSessionId(0.5);
        expect(id).toBeTypeOf('string');
    });

    it('returns zero-padded 6-digit string for typical seed', () => {
        const id = formatSessionId(0.42);
        expect(id).toBe('420000');
        expect(id).toHaveLength(6);
    });

    it('returns 000000 for seed 0', () => {
        const id = formatSessionId(0);
        expect(id).toBe('000000');
    });

    it('returns 999999 for seed approaching 1', () => {
        const id = formatSessionId(0.999999);
        expect(id).toBe('999999');
    });

    it('handles negative seed by using absolute value', () => {
        const id = formatSessionId(-0.42);
        expect(id).toBe('420000');
    });

    it('always returns at least 6 characters for valid seeds', () => {
        const seeds = [0, 0.001, 0.5, 0.999, -0.5];
        for (const seed of seeds) {
            const id = formatSessionId(seed);
            expect(id.length).toBeGreaterThanOrEqual(6);
        }
    });

    it('seed of exactly 1 produces 7-digit string', () => {
        const id = formatSessionId(1);
        expect(id).toBe('1000000');
        expect(id).toHaveLength(7);
    });

    it('returns numeric-only string', () => {
        const id = formatSessionId(0.123456);
        expect(/^\d{6}$/.test(id)).toBe(true);
    });

    it('different seeds produce different ids', () => {
        const id1 = formatSessionId(0.1);
        const id2 = formatSessionId(0.2);
        expect(id1).not.toBe(id2);
    });

    it('small seed produces small id with leading zeros', () => {
        const id = formatSessionId(0.000001);
        expect(id).toBe('000001');
    });
});
