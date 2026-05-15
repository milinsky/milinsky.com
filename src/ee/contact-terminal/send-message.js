const FORMSPREE_URL = 'https://formspree.io/f/xqenrqwj';

export async function sendMessage(subject, body) {
    try {
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message: body }),
        });
        return response.ok;
    } catch {
        return false;
    }
}
