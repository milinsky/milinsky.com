import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initConsoleDrop } from '../../src/ee/console-drop.js';

describe('console-drop', () => {
    let eeManager;
    let eeT;
    let logSpy;

    beforeEach(() => {
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        eeManager = {
            discover: vi.fn(),
            getDailySeed: vi.fn(() => 0),
        };
        eeT = vi.fn((key) => {
            const map = {
                ee_console_box_1: 'Hello Developer',
                ee_console_box_2: 'Welcome to MILINSKY',
                ee_console_box_3: 'Have a nice day!',
            };
            return map[key] ?? key;
        });
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    it('calls eeManager.discover with ee06', () => {
        initConsoleDrop(eeManager, eeT);
        expect(eeManager.discover).toHaveBeenCalledWith('ee06');
    });

    it('calls eeT for console box translations', () => {
        initConsoleDrop(eeManager, eeT);
        expect(eeT).toHaveBeenCalledWith('ee_console_box_1');
        expect(eeT).toHaveBeenCalledWith('ee_console_box_2');
        expect(eeT).toHaveBeenCalledWith('ee_console_box_3');
    });

    it('outputs bordered box to console.log', () => {
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('\u250C'))).toBe(true);
        expect(calls.some((c) => typeof c === 'string' && c.includes('\u2514'))).toBe(true);
    });

    it('outputs translated text lines inside box', () => {
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('Hello Developer'))).toBe(true);
        expect(calls.some((c) => typeof c === 'string' && c.includes('Welcome to MILINSKY'))).toBe(true);
        expect(calls.some((c) => typeof c === 'string' && c.includes('Have a nice day!'))).toBe(true);
    });

    it('outputs fake kernel logs from daily seed set 0', () => {
        eeManager.getDailySeed.mockReturnValue(0);
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('[kernel] MILINSKY.OS loaded'))).toBe(true);
        expect(calls.some((c) => typeof c === 'string' && c.includes('[auth] visitor authenticated'))).toBe(true);
    });

    it('outputs fake kernel logs from daily seed set 1', () => {
        eeManager.getDailySeed.mockReturnValue(1);
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('v4.2.0 booted'))).toBe(true);
    });

    it('outputs fake kernel logs from daily seed set 2', () => {
        eeManager.getDailySeed.mockReturnValue(2);
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('MILINSKY.OS initialized'))).toBe(true);
    });

    it('uses dailySeed modulo for log selection', () => {
        eeManager.getDailySeed.mockReturnValue(5);
        initConsoleDrop(eeManager, eeT);
        const calls = logSpy.mock.calls.map((c) => c[0]);
        expect(calls.some((c) => typeof c === 'string' && c.includes('[kernel]'))).toBe(true);
    });

    it('calls console.log 9 times total (5 box + 4 logs)', () => {
        initConsoleDrop(eeManager, eeT);
        expect(logSpy).toHaveBeenCalledTimes(9);
    });
});
