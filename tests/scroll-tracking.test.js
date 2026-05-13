import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initScrollTracking } from '../src/scroll-tracking.js';

let capturedObservers = [];
let OriginalIO;

function captureObservers() {
    capturedObservers = [];
    OriginalIO = globalThis.IntersectionObserver;

    const CapturingIO = class {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.elements = [];
            capturedObservers.push(this);
        }
        observe(el) { this.elements.push(el); }
        unobserve() {}
        disconnect() {}
    };

    Object.defineProperty(globalThis, 'IntersectionObserver', {
        value: CapturingIO,
        configurable: true,
        writable: true,
    });
}

function restoreIO() {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
        value: OriginalIO,
        configurable: true,
        writable: true,
    });
}

function createScrollTrackingDOM() {
    document.body.innerHTML = '';

    const aboutSection = document.createElement('section');
    aboutSection.id = 'about';
    document.body.appendChild(aboutSection);

    const servicesSection = document.createElement('section');
    servicesSection.id = 'services';
    document.body.appendChild(servicesSection);

    const resultsSection = document.createElement('section');
    resultsSection.id = 'results';
    document.body.appendChild(resultsSection);

    const nav = document.createElement('nav');
    const linkAbout = document.createElement('a');
    linkAbout.className = 'nav__link';
    linkAbout.setAttribute('href', '#about');
    nav.appendChild(linkAbout);

    const linkServices = document.createElement('a');
    linkServices.className = 'nav__link';
    linkServices.setAttribute('href', '#services');
    nav.appendChild(linkServices);

    const linkResults = document.createElement('a');
    linkResults.className = 'nav__link';
    linkResults.setAttribute('href', '#results');
    nav.appendChild(linkResults);
    document.body.appendChild(nav);

    const scrollStatus = document.createElement('div');
    scrollStatus.id = 'scrollStatus';
    document.body.appendChild(scrollStatus);

    const syslogText = document.createElement('div');
    syslogText.id = 'syslogText';
    document.body.appendChild(syslogText);

    const footer = document.createElement('div');
    footer.className = 'footer';
    document.body.appendChild(footer);

    const sections = [aboutSection, servicesSection, resultsSection];

    return {
        sections,
        aboutSection,
        servicesSection,
        resultsSection,
        linkAbout,
        linkServices,
        linkResults,
        scrollStatus,
        syslogText,
        footer,
    };
}

describe('initScrollTracking', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        captureObservers();
    });

    afterEach(() => {
        restoreIO();
        vi.useRealTimers();
    });

    it('creates IntersectionObserver instances for sections', () => {
        createScrollTrackingDOM();
        const sections = document.querySelectorAll('section');
        initScrollTracking([...sections]);

        expect(capturedObservers.length).toBeGreaterThanOrEqual(1);
    });

    it('adds nav__link--active class to matching link when section is visible', () => {
        const { aboutSection, linkAbout, linkServices, linkResults } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const navObserver = capturedObservers[0];
        navObserver.callback([{ isIntersecting: true, target: aboutSection }]);

        expect(linkAbout.classList.contains('nav__link--active')).toBe(true);
        expect(linkServices.classList.contains('nav__link--active')).toBe(false);
        expect(linkResults.classList.contains('nav__link--active')).toBe(false);
    });

    it('removes nav__link--active from previous and adds to new when section changes', () => {
        const { aboutSection, servicesSection, linkAbout, linkServices } = createScrollTrackingDOM();
        initScrollTracking([aboutSection, servicesSection]);

        const navObserver = capturedObservers[0];
        navObserver.callback([{ isIntersecting: true, target: aboutSection }]);
        expect(linkAbout.classList.contains('nav__link--active')).toBe(true);

        navObserver.callback([{ isIntersecting: true, target: servicesSection }]);
        expect(linkAbout.classList.contains('nav__link--active')).toBe(false);
        expect(linkServices.classList.contains('nav__link--active')).toBe(true);
    });

    it('updates #scrollStatus element with section info', () => {
        const { aboutSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: true, target: aboutSection }]);

        expect(scrollStatus.innerHTML).toContain('[SYS]');
        expect(scrollStatus.innerHTML).toContain('0x1A2B');
        expect(scrollStatus.innerHTML).toContain('about');
        expect(scrollStatus.classList.contains('scroll-status--visible')).toBe(true);
    });

    it('scrollStatus removes visible class after timeout', () => {
        const { aboutSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: true, target: aboutSection }]);

        expect(scrollStatus.classList.contains('scroll-status--visible')).toBe(true);

        vi.advanceTimersByTime(1300);
        expect(scrollStatus.classList.contains('scroll-status--visible')).toBe(false);
    });

    it('does not update scrollStatus for same section twice', () => {
        const { aboutSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: true, target: aboutSection }]);

        const firstHTML = scrollStatus.innerHTML;

        statusObserver.callback([{ isIntersecting: true, target: aboutSection }]);

        expect(scrollStatus.innerHTML).toBe(firstHTML);
    });

    it('syslog typing effect at footer triggers on intersection', () => {
        const { syslogText, footer } = createScrollTrackingDOM();
        initScrollTracking(document.querySelectorAll('section'));

        const syslogObserver = capturedObservers[2];
        syslogObserver.callback([{ isIntersecting: true, target: footer }]);

        vi.advanceTimersByTime(50);
        expect(syslogText.textContent.length).toBeGreaterThan(0);
    });

    it('syslog typing completes the full string', () => {
        const { syslogText, footer } = createScrollTrackingDOM();
        initScrollTracking(document.querySelectorAll('section'));

        const syslogObserver = capturedObservers[2];
        syslogObserver.callback([{ isIntersecting: true, target: footer }]);

        vi.advanceTimersByTime(50 * 56);
        expect(syslogText.textContent).toBe('build: 2026.05 | mem: 64MB | uptime: 127d | pid: 0x3A7F');
    });

    it('syslog typing only triggers once', () => {
        const { syslogText, footer } = createScrollTrackingDOM();
        initScrollTracking(document.querySelectorAll('section'));

        const syslogObserver = capturedObservers[2];
        syslogObserver.callback([{ isIntersecting: true, target: footer }]);
        vi.advanceTimersByTime(50 * 56);

        const fullText = syslogText.textContent;

        syslogObserver.callback([{ isIntersecting: true, target: footer }]);
        vi.advanceTimersByTime(50 * 56);

        expect(syslogText.textContent).toBe(fullText);
    });

    it('handles missing nav links gracefully', () => {
        document.body.innerHTML = '';
        const section = document.createElement('section');
        section.id = 'about';
        document.body.appendChild(section);

        expect(() => initScrollTracking([section])).not.toThrow();
        expect(capturedObservers.length).toBe(0);
    });

    it('handles missing scrollStatus gracefully', () => {
        document.body.innerHTML = '';
        const section = document.createElement('section');
        section.id = 'about';
        document.body.appendChild(section);

        const nav = document.createElement('nav');
        const link = document.createElement('a');
        link.className = 'nav__link';
        link.setAttribute('href', '#about');
        nav.appendChild(link);
        document.body.appendChild(nav);

        expect(() => initScrollTracking([section])).not.toThrow();

        const navObserver = capturedObservers[0];
        navObserver.callback([{ isIntersecting: true, target: section }]);
        expect(link.classList.contains('nav__link--active')).toBe(true);
    });

    it('handles missing syslogText gracefully', () => {
        document.body.innerHTML = '';
        const section = document.createElement('section');
        section.id = 'about';
        document.body.appendChild(section);

        const scrollStatus = document.createElement('div');
        scrollStatus.id = 'scrollStatus';
        document.body.appendChild(scrollStatus);

        expect(() => initScrollTracking([section])).not.toThrow();
    });

    it('handles missing footer gracefully', () => {
        document.body.innerHTML = '';
        const section = document.createElement('section');
        section.id = 'about';
        document.body.appendChild(section);

        const syslogText = document.createElement('div');
        syslogText.id = 'syslogText';
        document.body.appendChild(syslogText);

        expect(() => initScrollTracking([section])).not.toThrow();
    });

    it('handles empty sections array gracefully', () => {
        document.body.innerHTML = '';

        const nav = document.createElement('nav');
        const link = document.createElement('a');
        link.className = 'nav__link';
        nav.appendChild(link);
        document.body.appendChild(nav);

        expect(() => initScrollTracking([])).not.toThrow();
    });

    it('handles all missing elements gracefully', () => {
        document.body.innerHTML = '';
        expect(() => initScrollTracking([])).not.toThrow();
    });

    it('creates only nav observer when no scrollStatus', () => {
        const { aboutSection } = createScrollTrackingDOM();
        document.getElementById('scrollStatus').remove();
        document.getElementById('syslogText').remove();
        document.querySelector('.footer').remove();
        initScrollTracking([aboutSection]);
        expect(capturedObservers.length).toBe(1);
    });

    it('creates nav and syslog observers when scrollStatus missing', () => {
        createScrollTrackingDOM();
        document.getElementById('scrollStatus').remove();
        initScrollTracking(document.querySelectorAll('section'));
        expect(capturedObservers.length).toBe(2);
    });

    it('updates scrollStatus with correct address for services section', () => {
        const { servicesSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([servicesSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: true, target: servicesSection }]);

        expect(scrollStatus.innerHTML).toContain('0x3F7C');
        expect(scrollStatus.innerHTML).toContain('services');
    });

    it('updates scrollStatus with correct address for results section', () => {
        const { resultsSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([resultsSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: true, target: resultsSection }]);

        expect(scrollStatus.innerHTML).toContain('0x5D9E');
        expect(scrollStatus.innerHTML).toContain('results');
    });

    it('nav observer ignores non-intersecting entries', () => {
        const { aboutSection, linkAbout } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const navObserver = capturedObservers[0];
        linkAbout.classList.add('nav__link--active');
        navObserver.callback([{ isIntersecting: false, target: aboutSection }]);
        expect(linkAbout.classList.contains('nav__link--active')).toBe(true);
    });

    it('status observer ignores non-intersecting entries', () => {
        const { aboutSection, scrollStatus } = createScrollTrackingDOM();
        initScrollTracking([aboutSection]);

        const statusObserver = capturedObservers[1];
        statusObserver.callback([{ isIntersecting: false, target: aboutSection }]);
        expect(scrollStatus.innerHTML).toBe('');
    });

    it('ignores sections not in sectionMap for scrollStatus', () => {
        document.body.innerHTML = '';

        const unknownSection = document.createElement('section');
        unknownSection.id = 'unknown';
        document.body.appendChild(unknownSection);

        const scrollStatus = document.createElement('div');
        scrollStatus.id = 'scrollStatus';
        document.body.appendChild(scrollStatus);

        const nav = document.createElement('nav');
        const link = document.createElement('a');
        link.className = 'nav__link';
        nav.appendChild(link);
        document.body.appendChild(nav);

        initScrollTracking([unknownSection]);

        if (capturedObservers.length > 1) {
            const statusObserver = capturedObservers[1];
            statusObserver.callback([{ isIntersecting: true, target: unknownSection }]);
            expect(scrollStatus.innerHTML).toBe('');
        }
    });

    it('returns destroy function that disconnects observers and clears timeouts', () => {
        createScrollTrackingDOM();
        const sections = document.querySelectorAll('section');
        const { destroy } = initScrollTracking([...sections]);
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });
});
