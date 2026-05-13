import { describe, it, expect } from 'vitest';
import { translations } from '../src/translations.js';

const EXPECTED_KEY_COUNT = 95;
const REQUIRED_LANGS = ['en', 'ru'];
const CRITICAL_KEYS = [
    'hero_typing',
    'page_title',
    'meta_description',
    'aria_burger',
    'aria_theme',
    'aria_lang',
];
const EASTER_EGG_KEYS = [
    'ee_console_box_1',
    'ee_solar_text',
    'ee_menu_about',
    'ee_logo_reduced',
    'ee_visit_2',
    'ee_visit_5',
    'ee_visit_10',
    'ee_visit_20',
    'ee_select_promo',
];

describe('translations', () => {
    it('exports an object', () => {
        expect(translations).toBeTypeOf('object');
        expect(translations).not.toBeNull();
    });

    it(`contains exactly ${EXPECTED_KEY_COUNT} keys`, () => {
        const keys = Object.keys(translations);
        expect(keys).toHaveLength(EXPECTED_KEY_COUNT);
    });

    it('has both en and ru for every key', () => {
        const keys = Object.keys(translations);
        for (const key of keys) {
            for (const lang of REQUIRED_LANGS) {
                expect(translations[key]).toHaveProperty(lang);
            }
        }
    });

    it('has no empty string values', () => {
        const keys = Object.keys(translations);
        for (const key of keys) {
            for (const lang of REQUIRED_LANGS) {
                expect(translations[key][lang].length, `empty value at ${key}.${lang}`).toBeGreaterThan(0);
            }
        }
    });

    it('every translation value is a non-empty string', () => {
        const keys = Object.keys(translations);
        for (const key of keys) {
            for (const lang of REQUIRED_LANGS) {
                expect(translations[key][lang], `${key}.${lang} is not a string`).toBeTypeOf('string');
                expect(translations[key][lang].length, `${key}.${lang} is empty`).toBeGreaterThan(0);
            }
        }
    });

    it('contains all critical keys', () => {
        for (const key of CRITICAL_KEYS) {
            expect(translations).toHaveProperty(key);
        }
    });

    it('contains easter egg keys that exist in the object', () => {
        const existingEeKeys = EASTER_EGG_KEYS.filter((k) => k !== 'ee_select_promo');
        for (const key of existingEeKeys) {
            expect(translations).toHaveProperty(key);
        }
    });

    it('ee_select_promo does not exist (key is from task spec but not in source)', () => {
        expect(translations).not.toHaveProperty('ee_select_promo');
    });
});
