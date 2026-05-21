import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCreateEeManager = vi.fn(() => ({
    discover: vi.fn(),
    isDiscovered: vi.fn(),
    getVisitCount: vi.fn(() => 1),
    getSessionSeed: vi.fn(() => 0.5),
    getDailySeed: vi.fn(() => 42),
    recordVisit: vi.fn(),
}));
const mockTranslations = { hero_typing: { en: 'Hello' } };
const mockEeT = vi.fn((key) => key);
const mockApplyLanguage = vi.fn();
const mockGetState = vi.fn((key) => {
    if (key === 'lang') return 'en';
    if (key === 'theme') return 'light';
    if (key === 'reducedMotion') return false;
    return undefined;
});
const mockSetState = vi.fn();
const mockSubscribe = vi.fn((key, cb) => () => {});
const mockInitTheme = vi.fn(() => ({ destroy: vi.fn() }));
const mockInitNavigation = vi.fn(() => ({ destroy: vi.fn() }));
const mockInitTyping = vi.fn(() => ({ restartTyping: vi.fn(), destroy: vi.fn() }));
const mockInitScrollProgress = vi.fn(() => ({ destroy: vi.fn() }));
const mockInitVisualEffects = vi.fn(() => ({ destroy: vi.fn() }));
const mockInitScrollTracking = vi.fn(() => ({ destroy: vi.fn() }));
const mockShowToast = vi.fn();
const mockCreateConsoleDrop = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreateLogoReveal = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreateLogoMorph = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreateContextMenu = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreateSolarized = vi.fn(() => ({
    show: vi.fn(),
    destroy: vi.fn(),
}));
const mockCreateSelectSecret = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreateVisitCounter = vi.fn(() => ({ destroy: vi.fn() }));
const mockCreatePrintResume = vi.fn(() => ({ destroy: vi.fn(), printResume: vi.fn() }));

vi.mock('../src/ee-manager.js', () => ({
    createEeManager: mockCreateEeManager,
}));
vi.mock('../src/translations/index.js', () => ({
    translations: mockTranslations,
}));
vi.mock('../src/i18n.js', () => ({
    eeT: mockEeT,
    applyLanguage: mockApplyLanguage,
}));
vi.mock('../src/state.js', () => ({
    getState: mockGetState,
    setState: mockSetState,
    subscribe: mockSubscribe,
}));
vi.mock('../src/theme.js', () => ({
    initTheme: mockInitTheme,
}));
vi.mock('../src/navigation.js', () => ({
    initNavigation: mockInitNavigation,
}));
vi.mock('../src/typing.js', () => ({
    initTyping: mockInitTyping,
}));
vi.mock('../src/scroll-progress.js', () => ({
    initScrollProgress: mockInitScrollProgress,
}));
vi.mock('../src/visual-effects.js', () => ({
    initVisualEffects: mockInitVisualEffects,
}));
vi.mock('../src/scroll-tracking.js', () => ({
    initScrollTracking: mockInitScrollTracking,
}));
vi.mock('../src/utils/toast.js', () => ({
    showToast: mockShowToast,
}));
vi.mock('../src/ee/console-drop.js', () => ({
    createConsoleDrop: mockCreateConsoleDrop,
}));
vi.mock('../src/logo-reveal.js', () => ({
    createLogoReveal: mockCreateLogoReveal,
}));
vi.mock('../src/ee/logo-morph.js', () => ({
    createLogoMorph: mockCreateLogoMorph,
}));
vi.mock('../src/ee/context-menu.js', () => ({
    createContextMenu: mockCreateContextMenu,
}));
vi.mock('../src/ee/solarized.js', () => ({
    createSolarized: mockCreateSolarized,
}));
vi.mock('../src/ee/select-secret.js', () => ({
    createSelectSecret: mockCreateSelectSecret,
}));
vi.mock('../src/ee/visit-counter.js', () => ({
    createVisitCounter: mockCreateVisitCounter,
}));
vi.mock('../src/ee/print-resume.js', () => ({
    createPrintResume: mockCreatePrintResume,
}));

function setupDOM() {
    document.body.innerHTML = '';

    const logoLink = document.createElement('a');
    logoLink.className = 'nav__logo';
    const logoPre = document.createElement('pre');
    logoPre.className = 'nav__logo-ascii';
    logoPre.textContent = 'ORIGINAL_LOGO';
    logoLink.appendChild(logoPre);
    document.body.appendChild(logoLink);

    const langBtn = document.createElement('button');
    langBtn.id = 'langToggle';
    const langText = document.createElement('span');
    langText.className = 'lang-toggle__text';
    langText.textContent = 'EN';
    langBtn.appendChild(langText);
    document.body.appendChild(langBtn);

    const section1 = document.createElement('section');
    section1.id = 'about';
    document.body.appendChild(section1);
    const section2 = document.createElement('section');
    section2.id = 'services';
    document.body.appendChild(section2);

    const label1 = document.createElement('div');
    label1.className = 'section__label';
    label1.setAttribute('data-section', 'about');
    document.body.appendChild(label1);
    const label2 = document.createElement('div');
    label2.className = 'section__label';
    label2.setAttribute('data-section', 'services');
    document.body.appendChild(label2);
}

function resetMocks() {
    localStorage.clear();
    localStorage.setItem('lang', 'en');
    mockCreateEeManager.mockClear();
    mockEeT.mockClear();
    mockApplyLanguage.mockClear();
    mockGetState.mockClear().mockImplementation((key) => {
        if (key === 'lang') return 'en';
        if (key === 'theme') return 'light';
        if (key === 'reducedMotion') return false;
        return undefined;
    });
    mockSetState.mockClear();
    mockSubscribe.mockClear().mockImplementation(() => () => {});
    mockInitTheme.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockInitNavigation.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockInitTyping.mockClear().mockReturnValue({ restartTyping: vi.fn(), destroy: vi.fn() });
    mockInitScrollProgress.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockInitVisualEffects.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockInitScrollTracking.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockShowToast.mockClear();
    mockCreateConsoleDrop.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockCreateLogoReveal.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockCreateLogoMorph.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockCreateContextMenu.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockCreateSolarized.mockClear().mockReturnValue({ show: vi.fn(), destroy: vi.fn() });
    mockCreateSelectSecret.mockClear().mockReturnValue({ destroy: vi.fn() });
    mockCreateVisitCounter.mockClear().mockReturnValue({ destroy: vi.fn() });
}

describe('main.js', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setupDOM();
        resetMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.resetModules();
    });

    async function importMain() {
        return import('../src/main.js');
    }

    it('calls createEeManager', async () => {
        await importMain();
        expect(mockCreateEeManager).toHaveBeenCalled();
    });

    it('calls eeManager.recordVisit explicitly', async () => {
        await importMain();
        const eeManager = mockCreateEeManager.mock.results[0].value;
        expect(eeManager.recordVisit).toHaveBeenCalled();
    });

    it('calls getState for lang', async () => {
        await importMain();
        expect(mockGetState).toHaveBeenCalledWith('lang');
    });

    it('sets html lang from getState', async () => {
        await importMain();
        expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('calls applyLanguage with current lang and translations', async () => {
        await importMain();
        expect(mockApplyLanguage).toHaveBeenCalledWith('en', mockTranslations);
    });

    it('subscribes to lang changes', async () => {
        await importMain();
        expect(mockSubscribe).toHaveBeenCalledWith('lang', expect.any(Function));
    });

    it('calls createSolarized with eeManager and t', async () => {
        await importMain();
        expect(mockCreateSolarized).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
        });
    });

    it('calls initTheme with html and solarized.show callback', async () => {
        await importMain();
        expect(mockInitTheme).toHaveBeenCalled();
        expect(mockInitTheme.mock.calls[0][0]).toBe(document.documentElement);
        expect(typeof mockInitTheme.mock.calls[0][1]).toBe('function');
    });

    it('solarized show callback calls solarized.show', async () => {
        await importMain();
        const solarizedInstance = mockCreateSolarized.mock.results[0].value;
        const showCb = mockInitTheme.mock.calls[0][1];
        showCb();
        expect(solarizedInstance.show).toHaveBeenCalled();
    });

    it('calls initNavigation', async () => {
        await importMain();
        expect(mockInitNavigation).toHaveBeenCalled();
    });

    it('calls createLogoReveal with reducedMotion', async () => {
        await importMain();
        expect(mockCreateLogoReveal).toHaveBeenCalledWith({ reducedMotion: false });
    });

    it('calls initTyping with translations and getCurrentLang function', async () => {
        await importMain();
        expect(mockInitTyping).toHaveBeenCalled();
        expect(mockInitTyping.mock.calls[0][0]).toBe(mockTranslations);
        expect(typeof mockInitTyping.mock.calls[0][1]).toBe('function');
    });

    it('getCurrentLang function from initTyping uses getState', async () => {
        let capturedGetLang = null;
        mockInitTyping.mockImplementation((_t, getLang) => {
            capturedGetLang = getLang;
            return { restartTyping: vi.fn(), destroy: vi.fn() };
        });
        await importMain();
        capturedGetLang();
        expect(mockGetState).toHaveBeenCalledWith('lang');
    });

    it('subscribes to lang for restartTyping', async () => {
        const mockRestart = vi.fn();
        mockInitTyping.mockReturnValue({ restartTyping: mockRestart, destroy: vi.fn() });
        await importMain();
        const langSubscriptions = mockSubscribe.mock.calls.filter((c) => c[0] === 'lang');
        expect(langSubscriptions.length).toBeGreaterThanOrEqual(1);
    });

    it('calls initScrollProgress', async () => {
        await importMain();
        expect(mockInitScrollProgress).toHaveBeenCalled();
    });

    it('calls initVisualEffects with no arguments', async () => {
        await importMain();
        expect(mockInitVisualEffects).toHaveBeenCalledWith();
    });

    it('calls initScrollTracking with no arguments', async () => {
        await importMain();
        expect(mockInitScrollTracking).toHaveBeenCalledWith();
    });

    it('calls createConsoleDrop with eeManager and t', async () => {
        await importMain();
        expect(mockCreateConsoleDrop).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
        });
    });

    it('calls createLogoMorph with correct context', async () => {
        await importMain();
        expect(mockCreateLogoMorph).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
            showToast: mockShowToast,
            reducedMotion: false,
        });
    });

    it('calls createContextMenu with correct context', async () => {
        await importMain();
        expect(mockCreateContextMenu).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
            showToast: mockShowToast,
            html: document.documentElement,
            printResume: expect.any(Function),
        });
    });

    it('calls createSelectSecret with eeManager and t', async () => {
        await importMain();
        expect(mockCreateSelectSecret).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
        });
    });

    it('calls createVisitCounter with eeManager and t', async () => {
        await importMain();
        expect(mockCreateVisitCounter).toHaveBeenCalledWith({
            eeManager: mockCreateEeManager.mock.results[0].value,
            t: expect.any(Function),
        });
    });

    it('t function calls eeT with key, translations, and current lang', async () => {
        await importMain();
        const tCall = mockCreateConsoleDrop.mock.calls[0][0].t;
        tCall('test_key');
        expect(mockEeT).toHaveBeenCalledWith('test_key', mockTranslations, 'en');
    });

    it('langToggle click sets next lang via setState', async () => {
        await importMain();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(mockSetState).toHaveBeenCalledWith('lang', 'ru');
    });

    it('langToggle click switches to en when lang is ru', async () => {
        mockGetState.mockImplementation((key) => {
            if (key === 'lang') return 'ru';
            if (key === 'theme') return 'light';
            if (key === 'reducedMotion') return false;
            return undefined;
        });
        await importMain();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(mockSetState).toHaveBeenCalledWith('lang', 'en');
    });

    it('langToggle click stores lang in localStorage', async () => {
        await importMain();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'ru');
    });

    it('works without langToggle button', async () => {
        document.getElementById('langToggle').remove();
        await expect(importMain()).resolves.toBeDefined();
    });

    it('works without .nav__logo-ascii element', async () => {
        document.querySelector('.nav__logo-ascii').remove();
        await expect(importMain()).resolves.toBeDefined();
        expect(mockCreateLogoMorph).toHaveBeenCalled();
    });

    it('safeInit catches errors gracefully', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        mockInitNavigation.mockImplementation(() => { throw new Error('test error'); });
        await expect(importMain()).resolves.toBeDefined();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('safeInit handles module returning undefined', async () => {
        mockInitNavigation.mockReturnValue(undefined);
        await expect(importMain()).resolves.toBeDefined();
    });

    it('safeInit handles module returning object without destroy', async () => {
        mockInitNavigation.mockReturnValue({ someProp: true });
        await expect(importMain()).resolves.toBeDefined();
    });

    it('lang subscription callback updates html lang and calls applyLanguage', async () => {
        await importMain();
        const langCallback = mockSubscribe.mock.calls.find((c) => c[0] === 'lang')[1];
        langCallback('ru');
        expect(document.documentElement.getAttribute('lang')).toBe('ru');
        expect(mockApplyLanguage).toHaveBeenCalledWith('ru', mockTranslations);
    });

    it('lang subscription triggers restartTyping', async () => {
        const mockRestart = vi.fn();
        mockInitTyping.mockReturnValue({ restartTyping: mockRestart, destroy: vi.fn() });
        await importMain();
        const langCallbacks = mockSubscribe.mock.calls.filter((c) => c[0] === 'lang');
        const lastLangCallback = langCallbacks[langCallbacks.length - 1][1];
        lastLangCallback('ru');
        expect(mockRestart).toHaveBeenCalled();
    });

    it('safeInit stores destroy functions from module results', async () => {
        const mockDestroy = vi.fn();
        mockInitNavigation.mockReturnValue({ destroy: mockDestroy });
        await importMain();
        expect(mockInitNavigation).toHaveBeenCalled();
    });

    it('createSolarized is called before initTheme', async () => {
        const callOrder = [];
        mockCreateSolarized.mockImplementation(() => {
            callOrder.push('solarized');
            return { show: vi.fn(), destroy: vi.fn() };
        });
        mockInitTheme.mockImplementation(() => {
            callOrder.push('theme');
            return { destroy: vi.fn() };
        });
        await importMain();
        expect(callOrder.indexOf('solarized')).toBeLessThan(callOrder.indexOf('theme'));
    });
});
