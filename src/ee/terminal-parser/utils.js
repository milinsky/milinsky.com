const HASH_WORDS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
const HASH_MOD = 1000;

export function getDailyPassword() {
    const str = new Date().toDateString() + 'milinsky-secret-salt';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
    }
    return HASH_WORDS[Math.abs(hash) % HASH_WORDS.length] + Math.abs(hash % HASH_MOD);
}

export function formatSessionId(seed) {
    const id = Math.floor(Math.abs(seed) * 1000000);
    return String(id).padStart(6, '0');
}
