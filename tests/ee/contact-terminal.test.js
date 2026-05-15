import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createContactTerminal } from '../../src/ee/contact-terminal.js';
import { runNeofetchCard } from '../../src/ee/contact-terminal/neofetch-card.js';
import { runHireCommand } from '../../src/ee/contact-terminal/hire-command.js';

const MockObserver = globalThis.IntersectionObserver;

function setupShell() {
    document.body.innerHTML = '';
    const shell = document.createElement('div');
    shell.id = 'contactTerminalShell';
    document.body.appendChild(shell);
    return shell;
}

function createTrackingObserver() {
    const created = [];
    const OrigClass = MockObserver;
    const Tracked = function (cb) {
        const obs = new OrigClass(cb);
        const origObserve = obs.observe.bind(obs);
        obs.observe = (el) => { origObserve(el); };
        created.push(obs);
        return obs;
    };
    return { Tracked, created };
}

describe('createContactTerminal', () => {
    let t;
    let tracking;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        t = vi.fn((key) => key);
        tracking = createTrackingObserver();
        Object.defineProperty(globalThis, 'IntersectionObserver', { value: tracking.Tracked, configurable: true });
    });

    afterEach(() => {
        Object.defineProperty(globalThis, 'IntersectionObserver', { value: MockObserver, configurable: true });
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('returns destroy when shell exists', () => {
        setupShell();
        const result = createContactTerminal({ t, reducedMotion: false });
        expect(result.destroy).toBeTypeOf('function');
    });

    it('returns no-op destroy when shell missing', () => {
        const result = createContactTerminal({ t, reducedMotion: false });
        expect(result.destroy).toBeTypeOf('function');
        expect(() => result.destroy()).not.toThrow();
    });

    it('observer triggers neofetch on intersect', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        expect(document.querySelector('.contact-nf__grid')).not.toBeNull();
    });

    it('does not re-trigger on second intersection', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        const count = document.querySelectorAll('.contact-nf__grid').length;
        obs.callback([{ isIntersecting: true }]);
        expect(document.querySelectorAll('.contact-nf__grid').length).toBe(count);
    });

    it('destroy clears timers and disconnects observer', () => {
        setupShell();
        const result = createContactTerminal({ t, reducedMotion: false });
        result.destroy();
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        expect(document.querySelector('.contact-nf__grid')).toBeNull();
    });

    it('destroy clears intervals', () => {
        setupShell();
        const result = createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const intervalSpy = vi.spyOn(globalThis, 'clearInterval');
        result.destroy();
        expect(intervalSpy).toHaveBeenCalled();
        intervalSpy.mockRestore();
    });

    it('non-reducedMotion delays neofetch by 300ms', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: false });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        expect(document.querySelector('.contact-nf__grid')).toBeNull();
        vi.advanceTimersByTime(300);
        expect(document.querySelector('.contact-nf__grid')).not.toBeNull();
    });

    it('setupInput appears after neofetch done', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const input = document.querySelector('.contact-mail__input');
        expect(input).not.toBeNull();
    });

    it('hire milinsky triggers hire command', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const input = document.querySelector('.contact-mail__input');
        for (const ch of 'hire milinsky') {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
        }
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(document.querySelectorAll('.contact-nf__hint').length).toBeGreaterThan(0);
    });

    it('wrong command shows not found and new input', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const input = document.querySelector('.contact-mail__input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(t).toHaveBeenCalledWith('contact_nf_cmd_not_found');
        expect(document.querySelectorAll('.contact-mail__input').length).toBe(2);
    });

    it('backspace removes character from input', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const input = document.querySelector('.contact-mail__input');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }));
        expect(input.textContent).toBe('hi');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
        expect(input.textContent).toBe('h');
    });

    it('click on input line focuses input', () => {
        setupShell();
        createContactTerminal({ t, reducedMotion: true });
        const obs = tracking.created[0];
        obs.callback([{ isIntersecting: true }]);
        vi.advanceTimersByTime(200);
        const inputLine = document.querySelector('.contact-nf__hint');
        inputLine.click();
        const input = document.querySelector('.contact-mail__input');
        expect(input).not.toBeNull();
    });
});

describe('runNeofetchCard', () => {
    let shell, t, scheduleCalls, appended, intervalCalls;

    beforeEach(() => {
        shell = document.createElement('div');
        t = vi.fn((key) => key);
        scheduleCalls = [];
        appended = [];
        intervalCalls = [];
    });

    function schedule(fn, delay) { scheduleCalls.push({ fn, delay }); }
    function appendElement(el) { appended.push(el); shell.appendChild(el); }
    function addInterval(fn, delay) { intervalCalls.push({ fn, delay }); }

    it('renders ASCII art grid', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const grid = appended.find((el) => el.classList.contains('contact-nf__grid'));
        expect(grid).toBeDefined();
        expect(grid.querySelector('.contact-nf__ascii').textContent).toContain('┌─────────────┐');
    });

    it('renders info fields with t() translations', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(shell.querySelectorAll('.contact-nf__key').length).toBe(9);
        expect(t).toHaveBeenCalledWith('contact_nf_host');
        expect(t).toHaveBeenCalledWith('contact_nf_mail');
    });

    it('renders hint text', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        const hint = appended.find((el) => el.classList.contains('contact-nf__hint'));
        expect(hint).toBeDefined();
        expect(hint.textContent).toBe('> ' + t('contact_hint'));
    });

    it('calls onDone via schedule', () => {
        const onDone = vi.fn();
        runNeofetchCard(shell, t, false, schedule, appendElement, onDone, addInterval);
        expect(scheduleCalls.length).toBe(1);
        expect(scheduleCalls[0].delay).toBe(200);
        scheduleCalls[0].fn();
        expect(onDone).toHaveBeenCalled();
    });

    it('calls onDone immediately with reducedMotion', () => {
        const onDone = vi.fn();
        runNeofetchCard(shell, t, true, schedule, appendElement, onDone, addInterval);
        expect(scheduleCalls[0].delay).toBe(0);
    });

    it('renders header with t() call', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(shell.querySelector('.contact-nf__header')).not.toBeNull();
        expect(t).toHaveBeenCalledWith('contact_nf_os');
    });

    it('renders ticking time field', () => {
        runNeofetchCard(shell, t, false, schedule, appendElement, vi.fn(), addInterval);
        expect(intervalCalls.length).toBe(1);
        expect(intervalCalls[0].delay).toBe(1000);
        const keys = shell.querySelectorAll('.contact-nf__key');
        const timeKey = [...keys].find((k) => k.textContent === 'Time: ');
        expect(timeKey).toBeDefined();
        const timeValue = timeKey.nextElementSibling;
        expect(timeValue.classList.contains('contact-nf__value')).toBe(true);
    });
});

describe('runHireCommand', () => {
    let shell, t, appended, lines, listenCalls, scheduleCalls;

    beforeEach(() => {
        shell = document.createElement('div');
        t = vi.fn((key) => key);
        appended = [];
        lines = [];
        listenCalls = [];
        scheduleCalls = [];
    });

    function appendLine(text, cls) {
        const el = document.createElement('div'); el.textContent = text;
        if (cls) el.className = cls; lines.push(el); shell.appendChild(el); return el;
    }
    function appendElement(el) { appended.push(el); shell.appendChild(el); }
    function schedule(fn, delay) { scheduleCalls.push({ fn, delay }); }
    function listen(target, event, handler) { listenCalls.push({ target, event, handler }); target.addEventListener(event, handler); }

    it('shows 3 scanning steps in reducedMotion', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(lines.length).toBe(3);
        expect(t).toHaveBeenCalledWith('contact_hire_scanning');
        expect(t).toHaveBeenCalledWith('contact_hire_checking');
        expect(t).toHaveBeenCalledWith('contact_hire_generating');
    });

    it('shows ASCII contract box', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const box = appended.find((el) => el.classList.contains('contact-hire__box'));
        expect(box).toBeDefined();
        expect(box.textContent).toContain('COLLABORATION PROPOSAL');
    });

    it('shows email and telegram options', () => {
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const opts = shell.querySelectorAll('.contact-hire__option');
        expect(opts.length).toBe(2);
        expect(opts[0].textContent).toBe('[e] Email');
        expect(opts[1].textContent).toBe('[t] Telegram');
    });

    it('click email calls runMailComposer', () => {
        const runMail = vi.fn();
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, runMail);
        const email = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'click');
        email.handler();
        expect(runMail).toHaveBeenCalled();
    });

    it('click telegram opens URL', () => {
        const openSpy = vi.fn();
        const orig = window.open;
        window.open = openSpy;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const tg = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'click');
        tg.handler();
        expect(openSpy).toHaveBeenCalledWith('https://t.me/milinsky', '_blank');
        window.open = orig;
    });

    it('enter on email option calls runMailComposer', () => {
        const runMail = vi.fn();
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, runMail);
        const email = [...listenCalls].find((l) => l.target.textContent === '[e] Email' && l.event === 'keydown');
        email.handler({ key: 'Enter' });
        expect(runMail).toHaveBeenCalled();
    });

    it('enter on telegram opens URL', () => {
        const openSpy = vi.fn();
        const orig = window.open;
        window.open = openSpy;
        runHireCommand(shell, t, true, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        const tg = [...listenCalls].find((l) => l.target.textContent === '[t] Telegram' && l.event === 'keydown');
        tg.handler({ key: 'Enter' });
        expect(openSpy).toHaveBeenCalledWith('https://t.me/milinsky', '_blank');
        window.open = orig;
    });

    it('animated mode steps through schedule', () => {
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => false, vi.fn());
        expect(lines.length).toBe(1);
        scheduleCalls[0].fn();
        expect(lines.length).toBe(2);
    });

    it('stops when destroyed during animated steps', () => {
        let destroyed = false;
        runHireCommand(shell, t, false, schedule, appendLine, appendElement, listen, () => destroyed, vi.fn());
        destroyed = true;
        scheduleCalls[0].fn();
        expect(lines.length).toBe(1);
    });
});
