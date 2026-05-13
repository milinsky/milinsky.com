export function createEeManager() {
    let discovered = new Set();
    try {
        const stored = localStorage.getItem('ee_discovered');
        if (stored) {
            discovered = new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Storage error:', e);
        discovered = new Set();
    }

    let rawSeed = sessionStorage.getItem('ee_session_seed');
    if (!rawSeed) {
        rawSeed = String(Math.random());
        sessionStorage.setItem('ee_session_seed', rawSeed);
    }
    const seedNum = parseFloat(rawSeed) || Math.random();

    function saveDiscovered() {
        try {
            localStorage.setItem('ee_discovered', JSON.stringify([...discovered]));
        } catch (e) {
            console.warn('Storage error:', e);
        }
    }

    function discover(id) {
        if (!discovered.has(id)) {
            discovered.add(id);
            saveDiscovered();
        }
    }

    function isDiscovered(id) {
        return discovered.has(id);
    }

    function recordVisit() {
        let count = 0;
        try {
            const c = localStorage.getItem('ee_visit_count');
            if (c) {
                count = parseInt(c, 10);
            }
        } catch (e) {
            console.warn('Storage error:', e);
        }
        if (isNaN(count)) {
            count = 0;
        }
        count = count + 1;
        try {
            localStorage.setItem('ee_visit_count', String(count));
            if (count === 1) {
                localStorage.setItem('ee_first_visit', new Date().toISOString());
            }
        } catch (e) {
            console.warn('Storage error:', e);
        }
    }

    function getVisitCount() {
        let count = 0;
        try {
            const c = localStorage.getItem('ee_visit_count');
            if (c) {
                count = parseInt(c, 10);
            }
        } catch (e) {
            console.warn('Storage error:', e);
        }
        if (isNaN(count)) {
            count = 0;
        }
        return count;
    }

    function getSessionSeed() {
        return seedNum;
    }

    function getDailySeed() {
        const str = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    recordVisit();

    return {
        discover,
        isDiscovered,
        getVisitCount,
        getSessionSeed,
        getDailySeed
    };
}
