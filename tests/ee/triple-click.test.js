import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTripleClick } from '../../src/ee/triple-click.js';

describe('triple-click', () => {
    let eeManager;
    let t;
    let nowMs;

    beforeEach(() => {
        document.body.innerHTML = '';
        vi.useFakeTimers();
        nowMs = 1000000;
        vi.spyOn(Date, 'now').mockImplementation(() => nowMs);

        eeManager = {
            discover: vi.fn(),
        };
        t = vi.fn((key) => `translated_${key}`);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function createSection(sectionName, content) {
        const section = document.createElement('section');
        section.id = sectionName;

        const container = document.createElement('div');
        container.className = 'container';

        const header = document.createElement('div');
        header.className = 'section__header';

        const label = document.createElement('span');
        label.className = 'section__label';
        label.setAttribute('data-section', sectionName);
        label.textContent = `> section_01 --${sectionName}`;
        header.appendChild(label);

        const contentEl = document.createElement('div');
        contentEl.className = 'section-content';
        contentEl.textContent = content;

        container.appendChild(header);
        container.appendChild(contentEl);
        section.appendChild(container);
        document.body.appendChild(section);

        return { section, container, label, contentEl };
    }

    function tripleClick(label) {
        nowMs += 100;
        label.click();
        nowMs += 100;
        label.click();
        nowMs += 100;
        label.click();
    }

    function doubleClick(label) {
        nowMs += 100;
        label.click();
        nowMs += 100;
        label.click();
    }

    it('returns early if no section labels exist', () => {
        document.body.innerHTML = '<div>nothing</div>';
        expect(() => createTripleClick({ eeManager, t })).not.toThrow();
    });

    it('returns destroy function', () => {
        const { label } = createSection('about', 'Original content');
        const { destroy } = createTripleClick({ eeManager, t });
        expect(destroy).toBeTypeOf('function');
        expect(() => destroy()).not.toThrow();
    });

    it('triple click within 500ms activates unredacted view', () => {
        const { label, container } = createSection('about', 'Original content');
        createTripleClick({ eeManager, t });

        tripleClick(label);

        const unredacted = container.querySelector('.ee-unredacted-content');
        expect(unredacted).not.toBeNull();
        expect(unredacted.textContent).toBe('translated_ee_unredacted_about');
    });

    it('double click does NOT activate unredacted view', () => {
        const { label, container } = createSection('about', 'Original content');
        createTripleClick({ eeManager, t });

        doubleClick(label);

        const unredacted = container.querySelector('.ee-unredacted-content');
        expect(unredacted).toBeNull();
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('calls discover ee19 once on first activation', () => {
        const { label } = createSection('services', 'Content');
        createTripleClick({ eeManager, t });

        tripleClick(label);
        tripleClick(label);

        expect(eeManager.discover).toHaveBeenCalledWith('ee19');
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
    });

    it('label text changes on activation using translation key', () => {
        const { label } = createSection('results', 'Content');
        createTripleClick({ eeManager, t });

        tripleClick(label);

        expect(label.textContent).toBe('translated_ee_unredacted_label_results');
        expect(t).toHaveBeenCalledWith('ee_unredacted_label_results');
    });

    it('content restores after 10 seconds', () => {
        const { label, container } = createSection('expertise', 'Original expertise content');
        createTripleClick({ eeManager, t });

        const originalLabel = label.textContent;
        tripleClick(label);

        expect(container.querySelector('.ee-unredacted-content')).not.toBeNull();

        vi.advanceTimersByTime(10000);

        expect(container.querySelector('.ee-unredacted-content')).toBeNull();
        expect(label.textContent).toBe(originalLabel);
    });

    it('destroy removes all listeners', () => {
        const { label, container } = createSection('contact', 'Content');
        const { destroy } = createTripleClick({ eeManager, t });

        destroy();

        tripleClick(label);

        expect(eeManager.discover).not.toHaveBeenCalled();
        expect(container.querySelector('.ee-unredacted-content')).toBeNull();
    });

    it('destroy prevents pending restore timer from firing', () => {
        const { label, container } = createSection('about', 'Original');
        const { destroy } = createTripleClick({ eeManager, t });

        tripleClick(label);
        destroy();
        vi.advanceTimersByTime(10000);

        expect(container.querySelector('.ee-unredacted-content')).not.toBeNull();
    });

    it('clicks beyond 500ms window reset counter', () => {
        const { label, container } = createSection('about', 'Content');
        createTripleClick({ eeManager, t });

        nowMs += 100;
        label.click();
        nowMs += 100;
        label.click();

        nowMs += 600;
        label.click();

        const unredacted = container.querySelector('.ee-unredacted-content');
        expect(unredacted).toBeNull();
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('does not activate when another section is already active', () => {
        const section1 = createSection('about', 'About content');
        const section2 = createSection('services', 'Services content');
        createTripleClick({ eeManager, t });

        tripleClick(section1.label);
        tripleClick(section2.label);

        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        const unredacted2 = section2.container.querySelector('.ee-unredacted-content');
        expect(unredacted2).toBeNull();
    });

    it('handles label without parent section gracefully', () => {
        const label = document.createElement('span');
        label.className = 'section__label';
        label.setAttribute('data-section', 'orphan');
        document.body.appendChild(label);

        createTripleClick({ eeManager, t });

        expect(() => tripleClick(label)).not.toThrow();
        expect(eeManager.discover).not.toHaveBeenCalled();
    });

    it('handles label without container gracefully', () => {
        const section = document.createElement('section');
        const label = document.createElement('span');
        label.className = 'section__label';
        label.setAttribute('data-section', 'nocontainer');
        section.appendChild(label);
        document.body.appendChild(section);

        createTripleClick({ eeManager, t });

        expect(() => tripleClick(label)).not.toThrow();
    });

    it('restores original content including child elements', () => {
        const { section, label, container } = createSection('about', '');
        const childDiv = document.createElement('div');
        childDiv.className = 'test-child';
        childDiv.textContent = 'child content';
        container.appendChild(childDiv);

        createTripleClick({ eeManager, t });
        tripleClick(label);

        vi.advanceTimersByTime(10000);

        const restored = container.querySelector('.test-child');
        expect(restored).not.toBeNull();
        expect(restored.textContent).toBe('child content');
    });

    it('works with all section types', () => {
        const sectionData = ['about', 'services', 'results', 'expertise', 'contact'];
        const created = [];
        for (const name of sectionData) {
            created.push(createSection(name, `${name} content`));
        }

        createTripleClick({ eeManager, t });

        tripleClick(created[3].label);

        expect(eeManager.discover).toHaveBeenCalledWith('ee19');
        const unredacted = created[3].container.querySelector('.ee-unredacted-content');
        expect(unredacted.textContent).toBe('translated_ee_unredacted_expertise');
    });

    it('schedule returns null when destroyed', () => {
        const { label } = createSection('about', 'Content');
        createTripleClick({ eeManager, t });

        tripleClick(label);

        vi.advanceTimersByTime(5000);

        vi.advanceTimersByTime(5000);

        expect(label.textContent).not.toContain('translated_');
    });

    it('second activation after restore does not call discover again', () => {
        const s1 = createSection('about', 'About content');
        const s2 = createSection('services', 'Services content');
        createTripleClick({ eeManager, t });

        tripleClick(s1.label);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(10000);

        tripleClick(s2.label);
        expect(eeManager.discover).toHaveBeenCalledTimes(1);
        const unredacted = s2.container.querySelector('.ee-unredacted-content');
        expect(unredacted).not.toBeNull();
    });
});
