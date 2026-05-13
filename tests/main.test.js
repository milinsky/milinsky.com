import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCreateEeManager = vi.fn(() => ({
    discover: vi.fn(),
    isDiscovered: vi.fn(),
    getVisitCount: vi.fn(() => 1),
    getSessionSeed: vi.fn(() => 0.5),
    getDailySeed: vi.fn(() => 42),
}));
const mockTranslations = { hero_typing: { en: 'Hello' } };
const mockEeT = vi.fn((key) => key);
const mockApplyLanguage = vi.fn();
const mockInitTheme = vi.fn();
const mockInitNavigation = vi.fn();
const mockInitTyping = vi.fn(() => ({ restartTyping: vi.fn() }));
const mockInitScrollProgress = vi.fn();
const mockInitVisualEffects = vi.fn();
const mockInitScrollTracking = vi.fn();
const mockEeShowToast = vi.fn();
const mockInitConsoleDrop = vi.fn();
const mockInitLogoReveal = vi.fn();
const mockInitLogoMorph = vi.fn();
const mockInitContextMenu = vi.fn();
const mockEeShowSolarizedDialog = vi.fn();
const mockInitSelectSecret = vi.fn();
const mockInitVisitCounter = vi.fn();

vi.mock('../src/ee-manager.js', () => ({
    createEeManager: mockCreateEeManager,
}));
vi.mock('../src/translations.js', () => ({
    translations: mockTranslations,
}));
vi.mock('../src/i18n.js', () => ({
    eeT: mockEeT,
    applyLanguage: mockApplyLanguage,
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
vi.mock('../src/ee/toast.js', () => ({
    eeShowToast: mockEeShowToast,
}));
vi.mock('../src/ee/console-drop.js', () => ({
    initConsoleDrop: mockInitConsoleDrop,
}));
vi.mock('../src/ee/logo-reveal.js', () => ({
    initLogoReveal: mockInitLogoReveal,
}));
vi.mock('../src/ee/logo-morph.js', () => ({
    initLogoMorph: mockInitLogoMorph,
}));
vi.mock('../src/ee/context-menu.js', () => ({
    initContextMenu: mockInitContextMenu,
}));
vi.mock('../src/ee/solarized.js', () => ({
    eeShowSolarizedDialog: mockEeShowSolarizedDialog,
}));
vi.mock('../src/ee/select-secret.js', () => ({
    initSelectSecret: mockInitSelectSecret,
}));
vi.mock('../src/ee/visit-counter.js', () => ({
    initVisitCounter: mockInitVisitCounter,
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

describe('main.js', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        setupDOM();
        localStorage.clear();
        localStorage.setItem('lang', 'en');
        mockCreateEeManager.mockClear();
        mockEeT.mockClear();
        mockApplyLanguage.mockClear();
        mockInitTheme.mockClear();
        mockInitNavigation.mockClear();
        mockInitTyping.mockClear().mockReturnValue({ restartTyping: vi.fn() });
        mockInitScrollProgress.mockClear();
        mockInitVisualEffects.mockClear();
        mockInitScrollTracking.mockClear();
        mockEeShowToast.mockClear();
        mockInitConsoleDrop.mockClear();
        mockInitLogoReveal.mockClear();
        mockInitLogoMorph.mockClear();
        mockInitContextMenu.mockClear();
        mockEeShowSolarizedDialog.mockClear();
        mockInitSelectSecret.mockClear();
        mockInitVisitCounter.mockClear();
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

    it('captures eeOriginalLogo from .nav__logo-ascii', async () => {
        await importMain();
        const logoPre = document.querySelector('.nav__logo-ascii');
        expect(logoPre.textContent).toBe('ORIGINAL_LOGO');
    });

    it('sets html lang from localStorage lang', async () => {
        localStorage.setItem('lang', 'ru');
        await importMain();
        expect(document.documentElement.getAttribute('lang')).toBe('ru');
    });

    it('defaults html lang to en when no localStorage lang', async () => {
        localStorage.clear();
        await importMain();
        expect(document.documentElement.getAttribute('lang')).toBe('en');
    });

    it('calls initConsoleDrop with eeManager and boundEeT', async () => {
        await importMain();
        expect(mockInitConsoleDrop).toHaveBeenCalled();
        expect(mockInitConsoleDrop.mock.calls[0][0]).toBe(mockCreateEeManager.mock.results[0].value);
        expect(typeof mockInitConsoleDrop.mock.calls[0][1]).toBe('function');
    });

    it('boundEeT calls eeT with translations and currentLang', async () => {
        await importMain();
        const boundEeT = mockInitConsoleDrop.mock.calls[0][1];
        boundEeT('test_key');
        expect(mockEeT).toHaveBeenCalledWith('test_key', mockTranslations, 'en');
    });

    it('calls initLogoReveal', async () => {
        await importMain();
        expect(mockInitLogoReveal).toHaveBeenCalled();
    });

    it('boundApplyLanguage updates lang and calls applyLanguage', async () => {
        await importMain();
        expect(mockApplyLanguage).toHaveBeenCalledWith('en', mockTranslations);
    });

    it('calls initTheme with html and solarized callback', async () => {
        await importMain();
        expect(mockInitTheme).toHaveBeenCalled();
        expect(mockInitTheme.mock.calls[0][0]).toBe(document.documentElement);
        expect(typeof mockInitTheme.mock.calls[0][1]).toBe('function');
    });

    it('solarized callback calls eeShowSolarizedDialog', async () => {
        await importMain();
        const solarizedCb = mockInitTheme.mock.calls[0][1];
        solarizedCb();
        expect(mockEeShowSolarizedDialog).toHaveBeenCalled();
    });

    it('calls initNavigation', async () => {
        await importMain();
        expect(mockInitNavigation).toHaveBeenCalled();
    });

    it('calls initTyping with translations and getCurrentLang function', async () => {
        await importMain();
        expect(mockInitTyping).toHaveBeenCalled();
        expect(mockInitTyping.mock.calls[0][0]).toBe(mockTranslations);
        expect(typeof mockInitTyping.mock.calls[0][1]).toBe('function');
    });

    it('calls initScrollProgress', async () => {
        await importMain();
        expect(mockInitScrollProgress).toHaveBeenCalled();
    });

    it('calls initVisualEffects with section labels', async () => {
        await importMain();
        expect(mockInitVisualEffects).toHaveBeenCalled();
        const labels = mockInitVisualEffects.mock.calls[0][0];
        expect(labels.length).toBe(2);
    });

    it('calls initScrollTracking with sections', async () => {
        await importMain();
        expect(mockInitScrollTracking).toHaveBeenCalled();
        const sections = mockInitScrollTracking.mock.calls[0][0];
        expect(sections.length).toBe(2);
    });

    it('calls initLogoMorph with correct args', async () => {
        await importMain();
        expect(mockInitLogoMorph).toHaveBeenCalled();
        const args = mockInitLogoMorph.mock.calls[0];
        expect(args[0]).toBe(mockCreateEeManager.mock.results[0].value);
        expect(args[1]).toBeTypeOf('object');
        expect(args[1].logoPre).toBe(document.querySelector('.nav__logo-ascii'));
        expect(args[1].originalLogo).toBe('ORIGINAL_LOGO');
        expect(typeof args[1].reducedMotion).toBe('boolean');
        expect(args[1].showToast).toBe(mockEeShowToast);
        expect(typeof args[1].t).toBe('function');
    });

    it('calls initContextMenu with correct args', async () => {
        await importMain();
        expect(mockInitContextMenu).toHaveBeenCalled();
        const args = mockInitContextMenu.mock.calls[0];
        expect(args[0]).toBe(mockCreateEeManager.mock.results[0].value);
        expect(typeof args[1]).toBe('function');
        expect(args[2]).toBe(mockEeShowToast);
        expect(args[3]).toBe(document.documentElement);
    });

    it('calls initSelectSecret with correct args', async () => {
        await importMain();
        expect(mockInitSelectSecret).toHaveBeenCalled();
        const args = mockInitSelectSecret.mock.calls[0];
        expect(args[0]).toBe(mockCreateEeManager.mock.results[0].value);
        expect(typeof args[1]).toBe('function');
    });

    it('calls initVisitCounter with correct args', async () => {
        await importMain();
        expect(mockInitVisitCounter).toHaveBeenCalled();
        const args = mockInitVisitCounter.mock.calls[0];
        expect(args[0]).toBe(mockCreateEeManager.mock.results[0].value);
        expect(typeof args[1]).toBe('function');
    });

    it('langToggle click switches language from en to ru', async () => {
        localStorage.setItem('lang', 'en');
        await importMain();
        const restartTyping = mockInitTyping.mock.results[0].value.restartTyping;
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(localStorage.getItem('lang')).toBe('ru');
    });

    it('langToggle click switches language from ru to en', async () => {
        localStorage.setItem('lang', 'ru');
        await importMain();
        mockApplyLanguage.mockClear();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(localStorage.getItem('lang')).toBe('en');
    });

    it('langToggle click calls boundApplyLanguage with next lang', async () => {
        localStorage.setItem('lang', 'en');
        await importMain();
        mockApplyLanguage.mockClear();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(mockApplyLanguage).toHaveBeenCalledWith('ru', mockTranslations);
    });

    it('langToggle click calls restartTyping', async () => {
        const mockRestart = vi.fn();
        mockInitTyping.mockReturnValue({ restartTyping: mockRestart });
        await importMain();
        const langBtn = document.getElementById('langToggle');
        langBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(mockRestart).toHaveBeenCalled();
    });

    it('works without langToggle button', async () => {
        document.getElementById('langToggle').remove();
        await expect(importMain()).resolves.toBeDefined();
    });

    it('works without .nav__logo-ascii element', async () => {
        document.querySelector('.nav__logo-ascii').remove();
        await expect(importMain()).resolves.toBeDefined();
        expect(mockInitLogoMorph).toHaveBeenCalled();
    });

    it('getCurrentLang function from initTyping returns current lang', async () => {
        let capturedGetLang = null;
        mockInitTyping.mockImplementation((_t, getLang) => {
            capturedGetLang = getLang;
            return { restartTyping: vi.fn() };
        });
        localStorage.setItem('lang', 'en');
        await importMain();
        expect(capturedGetLang()).toBe('en');
    });
});
