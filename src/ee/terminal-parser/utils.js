const HASH_BITSHIFT = 5;
const HASH_WORDS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
const HASH_MOD = 1000;
const SESSION_ID_SCALE = 1_000_000;

export function getDailyPassword() {
    const str = new Date().toDateString() + 'milinsky-secret-salt';
    let hash = 0;
    for (const ch of str) {
        hash = (hash << HASH_BITSHIFT) - hash + ch.charCodeAt(0);
        hash = hash & hash;
    }
    return HASH_WORDS[Math.abs(hash) % HASH_WORDS.length] + Math.abs(hash % HASH_MOD);
}

export function formatSessionId(seed) {
    const id = Math.floor(Math.abs(seed) * SESSION_ID_SCALE);
    return String(id).padStart(6, '0');
}
