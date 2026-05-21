import { describe, it, expect } from 'vitest';
import { seededRandom, shuffleArray } from '../../../src/ee/context-menu/shuffle.js';

describe('context-menu/shuffle', () => {
    describe('seededRandom', () => {
        it('returns value between 0 and 1', () => {
            const result = seededRandom(42);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });

        it('is deterministic with same seed', () => {
            expect(seededRandom(42)).toBe(seededRandom(42));
        });

        it('produces different values for different seeds', () => {
            expect(seededRandom(1)).not.toBe(seededRandom(2));
        });

        it('handles seed 0', () => {
            const result = seededRandom(0);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });

        it('handles negative seeds', () => {
            const result = seededRandom(-10);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });

        it('distributes values across range', () => {
            const results = new Set();
            for (let i = 0; i < 100; i++) {
                results.add(Math.floor(seededRandom(i) * 10));
            }
            expect(results.size).toBeGreaterThanOrEqual(5);
        });
    });

    describe('shuffleArray', () => {
        it('returns new array without mutating original', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(original, 42);
            expect(original).toEqual([1, 2, 3, 4, 5]);
            expect(shuffled).not.toBe(original);
        });

        it('preserves all elements', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(arr, 42);
            expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
        });

        it('is deterministic with same seed', () => {
            const arr = ['a', 'b', 'c', 'd', 'e'];
            expect(shuffleArray(arr, 7)).toEqual(shuffleArray(arr, 7));
        });

        it('produces different order with different seeds', () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const result1 = shuffleArray(arr, 1);
            const result2 = shuffleArray(arr, 2);
            expect(result1).not.toEqual(result2);
        });

        it('handles empty array', () => {
            expect(shuffleArray([], 42)).toEqual([]);
        });

        it('handles single element array', () => {
            expect(shuffleArray([42], 99)).toEqual([42]);
        });

        it('handles two element array', () => {
            const result = shuffleArray([1, 2], 42);
            expect(result.sort()).toEqual([1, 2]);
        });

        it('produces different permutations across seeds', () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8];
            const orders = new Set();
            for (let seed = 0; seed < 20; seed++) {
                orders.add(shuffleArray(arr, seed).join(','));
            }
            expect(orders.size).toBeGreaterThanOrEqual(5);
        });
    });
});
