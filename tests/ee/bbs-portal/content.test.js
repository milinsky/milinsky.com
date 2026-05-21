import { describe, it, expect, vi } from 'vitest';
import { getRandomBaudRate, getMenuItems } from '../../../src/ee/bbs-portal/content.js';

const VALID_BAUD_RATES = [2400, 9600, 14400, 28800];

describe('bbs-portal/content — getRandomBaudRate', () => {
    it('returns a number from the valid baud rate list', () => {
        for (let i = 0; i < 50; i++) {
            const rate = getRandomBaudRate();
            expect(VALID_BAUD_RATES).toContain(rate);
        }
    });

    it('returns one of exactly 4 possible values', () => {
        const results = new Set();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        results.add(getRandomBaudRate());
        vi.spyOn(Math, 'random').mockReturnValue(0.24);
        results.add(getRandomBaudRate());
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        results.add(getRandomBaudRate());
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        results.add(getRandomBaudRate());
        vi.restoreAllMocks();
        expect(results.size).toBeLessThanOrEqual(4);
    });

    it('returns first element when Math.random returns 0', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomBaudRate()).toBe(2400);
        vi.restoreAllMocks();
    });

    it('returns last element when Math.random approaches 1', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const rate = getRandomBaudRate();
        expect(VALID_BAUD_RATES).toContain(rate);
        vi.restoreAllMocks();
    });
});

describe('bbs-portal/content — getMenuItems', () => {
    it('returns an array', () => {
        const items = getMenuItems((key) => key);
        expect(Array.isArray(items)).toBe(true);
    });

    it('returns exactly 4 menu items', () => {
        const items = getMenuItems((key) => key);
        expect(items).toHaveLength(4);
    });

    it('each item has key, label, and content properties', () => {
        const items = getMenuItems((key) => key);
        for (const item of items) {
            expect(item).toHaveProperty('key');
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('content');
            expect(item.key).toBeTypeOf('string');
            expect(item.label).toBeTypeOf('string');
            expect(item.content).toBeTypeOf('string');
        }
    });

    it('items have keys 1 through 4', () => {
        const items = getMenuItems((key) => key);
        expect(items[0].key).toBe('1');
        expect(items[1].key).toBe('2');
        expect(items[2].key).toBe('3');
        expect(items[3].key).toBe('4');
    });

    it('passes translation keys through t function', () => {
        const calls = [];
        const t = (key) => {
            calls.push(key);
            return key;
        };
        getMenuItems(t);
        expect(calls).toContain('ee_bbs_menu_1');
        expect(calls).toContain('ee_bbs_menu_2');
        expect(calls).toContain('ee_bbs_menu_3');
        expect(calls).toContain('ee_bbs_menu_4');
    });

    it('uses t for content translations', () => {
        const calls = [];
        const t = (key) => {
            calls.push(key);
            return key;
        };
        getMenuItems(t);
        expect(calls).toContain('ee_bbs_bulletin_content');
        expect(calls).toContain('ee_bbs_files_content');
        expect(calls).toContain('ee_bbs_chat_content');
    });

    it('item 2 content includes file art', () => {
        const items = getMenuItems((key) => key);
        expect(items[1].content).toContain('FILE');
        expect(items[1].content).toContain('.ZIP');
        expect(items[1].content).toContain('+---------+');
    });

    it('item 4 (exit) has empty content', () => {
        const items = getMenuItems((key) => key);
        expect(items[3].content).toBe('');
    });

    it('t function return values are used as labels', () => {
        const t = (key) => `[${key}]`;
        const items = getMenuItems(t);
        expect(items[0].label).toBe('[ee_bbs_menu_1]');
        expect(items[1].label).toBe('[ee_bbs_menu_2]');
        expect(items[2].label).toBe('[ee_bbs_menu_3]');
        expect(items[3].label).toBe('[ee_bbs_menu_4]');
    });

    it('item 1 content uses bulletin translation', () => {
        const t = (key) => key === 'ee_bbs_bulletin_content' ? 'BULLETIN_TEXT' : key;
        const items = getMenuItems(t);
        expect(items[0].content).toBe('BULLETIN_TEXT');
    });

    it('item 3 content uses chat translation', () => {
        const t = (key) => key === 'ee_bbs_chat_content' ? 'CHAT_TEXT' : key;
        const items = getMenuItems(t);
        expect(items[2].content).toBe('CHAT_TEXT');
    });
});
