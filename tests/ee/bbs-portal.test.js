import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBbsPortal } from '../../src/ee/bbs-portal.js';
import { playModemTones } from '../../src/ee/bbs-portal/audio.js';
import { getRandomBaudRate, getMenuItems } from '../../src/ee/bbs-portal/content.js';

const TRANSLATIONS = {
    ee_bbs_connecting: 'ATDT 555-1337\nCONNECTING...',
    ee_bbs_header: 'MILINSKY BBS v2.1\n(C) 1996 Milinsky SoftWorks',
    ee_bbs_speed: 'Connected at {baud} baud.',
    ee_bbs_menu_1: 'Bulletin Board',
    ee_bbs_menu_2: 'File Library',
    ee_bbs_menu_3: 'Chat with SysOp',
    ee_bbs_menu_4: 'Exit',
    ee_bbs_bulletin_content: 'WELCOME TO MILINSKY BBS!',
    ee_bbs_files_content: 'Downloading...',
    ee_bbs_chat_content: 'SysOp is: AWAY',
    ee_bbs_goodbye: 'NO CARRIER\nGoodbye!',
};

function makeCtx(overrides = {}) {
    return {
        eeManager: { discover: vi.fn() },
        t: vi.fn((key) => TRANSLATIONS[key] ?? key),
        reducedMotion: false,
        ...overrides,
    };
}

function setHash(hash) {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: '', newURL: 'http://localhost/' + hash }));
}

describe('bbs-portal', () => {
    let ctx, destroyFn;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '<div id="original">Original content</div>';
        window.location.hash = '';
        ctx = makeCtx();
        destroyFn = null;
    });

    afterEach(() => {
        if (destroyFn) destroyFn();
        window.location.hash = '';
        document.body.innerHTML = '';
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function init(overrides = {}) {
        const result = createBbsPortal({ ...ctx, ...overrides });
        destroyFn = result.destroy;
        return result;
    }

    function activateAndWait() {
        setHash('#bbs');
        vi.advanceTimersByTime(5000);
    }

    it('returns destroy function that does not throw', () => {
        const { destroy } = init();
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('#bbs activates BBS interface', () => {
        init();
        activateAndWait();
        expect(document.querySelector('.ee-bbs-screen')).not.toBeNull();
    });

    it('adds ee-bbs-active class on activation', () => {
        init();
        activateAndWait();
        expect(document.body.classList.contains('ee-bbs-active')).toBe(true);
    });

    it('preserves original DOM during BBS mode', () => {
        init();
        activateAndWait();
        expect(document.querySelector('#original')).not.toBeNull();
        expect(document.querySelector('#original').textContent).toBe('Original content');
    });

    it('discover ee14 is called once on activation', () => {
        init();
        activateAndWait();
        activateAndWait();
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee14');
        expect(ctx.eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('modem tones are created via AudioContext', () => {
        init();
        activateAndWait();
        expect(globalThis.AudioContext).toHaveBeenCalled();
    });

    it('reducedMotion skips modem tones', () => {
        globalThis.AudioContext.mockClear();
        init({ reducedMotion: true });
        activateAndWait();
        expect(globalThis.AudioContext).not.toHaveBeenCalled();
    });

    it('header text appears after typewriter', () => {
        init();
        activateAndWait();
        const header = document.querySelector('.ee-bbs-header');
        expect(header).not.toBeNull();
        expect(header.textContent).toContain('MILINSKY BBS');
    });

    it('4 menu items are rendered', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        expect(items).toHaveLength(4);
    });

    it('menu item [1] shows bulletin content', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        items[0].click();
        const content = document.querySelector('.ee-bbs-content');
        expect(content.textContent).toContain('WELCOME');
    });

    it('menu item [2] shows file content', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        items[1].click();
        const content = document.querySelector('.ee-bbs-content');
        expect(content.textContent).toContain('Downloading');
    });

    it('menu item [3] shows chat content', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        items[2].click();
        const content = document.querySelector('.ee-bbs-content');
        expect(content.textContent).toContain('SysOp');
    });

    it('menu item [4] Exit restores original DOM', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        items[3].click();
        expect(document.querySelector('.ee-bbs-screen')).toBeNull();
        expect(document.body.classList.contains('ee-bbs-active')).toBe(false);
        expect(document.querySelector('#original')).not.toBeNull();
    });

    it('non-#bbs hash does not activate', () => {
        init();
        setHash('#other');
        vi.advanceTimersByTime(5000);
        expect(document.querySelector('.ee-bbs-screen')).toBeNull();
        expect(ctx.eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy cleans up DOM and restores original', () => {
        init();
        activateAndWait();
        destroyFn();
        expect(document.querySelector('.ee-bbs-screen')).toBeNull();
        expect(document.body.classList.contains('ee-bbs-active')).toBe(false);
        expect(document.querySelector('#original')).not.toBeNull();
    });

    it('destroy removes hashchange listener', () => {
        const { destroy } = init();
        destroy();
        destroyFn = null;
        setHash('#bbs');
        vi.advanceTimersByTime(5000);
        expect(ctx.eeManager.discover).not.toHaveBeenCalled();
    });

    it('destroy clears pending timers', () => {
        init();
        setHash('#bbs');
        destroyFn();
        vi.advanceTimersByTime(10000);
        expect(document.querySelector('.ee-bbs-screen')).toBeNull();
    });

    it('activate on init if hash already #bbs', () => {
        window.location.hash = '#bbs';
        init();
        vi.advanceTimersByTime(5000);
        expect(document.querySelector('.ee-bbs-screen')).not.toBeNull();
        expect(ctx.eeManager.discover).toHaveBeenCalledWith('ee14');
    });

    it('content clears after timeout', () => {
        init();
        activateAndWait();
        const items = document.querySelectorAll('.ee-bbs-menu__item');
        items[0].click();
        const content = document.querySelector('.ee-bbs-content');
        expect(content.textContent.length).toBeGreaterThan(0);
        vi.advanceTimersByTime(4000);
        expect(content.textContent).toBe('');
    });

    it('destroy without activation does not throw', () => {
        const { destroy } = init();
        expect(() => destroy()).not.toThrow();
        expect(document.querySelector('.ee-bbs-screen')).toBeNull();
        expect(document.body.classList.contains('ee-bbs-active')).toBe(false);
    });
});

describe('bbs-portal/audio', () => {
    it('playModemTones returns stop function', () => {
        const handle = playModemTones();
        expect(handle.stop).toBeTypeOf('function');
        expect(() => handle.stop()).not.toThrow();
    });

    it('creates oscillator and gain nodes', () => {
        playModemTones();
        expect(globalThis.AudioContext).toHaveBeenCalled();
    });
});

describe('bbs-portal/content', () => {
    it('getRandomBaudRate returns a valid baud rate', () => {
        const rate = getRandomBaudRate();
        expect([2400, 9600, 14400, 28800]).toContain(rate);
    });

    it('getMenuItems returns 4 items with correct keys', () => {
        const t = (key) => TRANSLATIONS[key] ?? key;
        const items = getMenuItems(t);
        expect(items).toHaveLength(4);
        expect(items[0].key).toBe('1');
        expect(items[3].key).toBe('4');
        expect(items[0].label).toBe('Bulletin Board');
        expect(items[3].label).toBe('Exit');
    });
});
