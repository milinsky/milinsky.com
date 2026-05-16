const HASH_MULTIPLIER = 10000;
const SEED_MULTIPLIER = 10000;

export function seededRandom(seed) {
    const x = Math.sin(seed + 1) * HASH_MULTIPLIER;
    return x - Math.floor(x);
}

export function shuffleArray(arr, seed) {
    const result = arr.slice();
    let s = seed * SEED_MULTIPLIER;
    for (let i = result.length - 1; i > 0; i--) {
        s = seededRandom(s);
        const j = Math.floor(s * (i + 1));
        const tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
    }
    return result;
}
