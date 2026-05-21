import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildItemList, createPanelDom, attachPanel } from '../../../src/ee/achievements/panel.js';

const EE_IDS = [
    'ee01',
    'ee02',
    'ee03',
    'ee04',
    'ee06',
    'ee08',
    'ee09',
    'ee10',
    'ee11',
    'ee12',
    'ee13',
    'ee14',
    'ee15',
    'ee16',
    'ee19',
    'ee21',
    'ee22',
    'ee-solarized',
];

function createMockEeManager(discovered = new Set()) {
    return {
        discover: vi.fn((id) => discovered.add(id)),
        isDiscovered: vi.fn((id) => discovered.has(id)),
    };
}

describe('achievements/panel', () => {
    let eeManager;
    let t;

    beforeEach(() => {
        document.body.innerHTML = '';
        eeManager = createMockEeManager();
        t = vi.fn((key) => key);
    });

    describe('buildItemList', () => {
        it('creates correct number of items', () => {
            const list = buildItemList(eeManager, t, EE_IDS);
            const items = list.querySelectorAll('.ee-ach-item');
            expect(items).toHaveLength(18);
        });

        it('marks discovered items as found', () => {
            eeManager.isDiscovered = vi.fn((id) => id === 'ee01' || id === 'ee08');
            const list = buildItemList(eeManager, t, EE_IDS);
            const found = list.querySelectorAll('.ee-ach-item--found');
            const locked = list.querySelectorAll('.ee-ach-item--locked');
            expect(found.length).toBe(2);
            expect(locked.length).toBe(16);
        });

        it('shows [+] for found items and [ ] for locked', () => {
            eeManager.isDiscovered = vi.fn((id) => id === 'ee01');
            const list = buildItemList(eeManager, t, EE_IDS);
            const items = list.querySelectorAll('.ee-ach-item');
            const foundItem = items[0];
            const lockedItem = items[1];
            expect(foundItem.querySelector('.ee-ach-item__icon').textContent).toBe('[+]');
            expect(lockedItem.querySelector('.ee-ach-item__icon').textContent).toBe('[ ]');
        });

        it('uses correct translation key for item names', () => {
            buildItemList(eeManager, t, EE_IDS);
            expect(t).toHaveBeenCalledWith('ee_ach_name_ee01');
            expect(t).toHaveBeenCalledWith('ee_ach_name_ee_solarized');
        });

        it('uses ee-ach-panel__list class', () => {
            const list = buildItemList(eeManager, t, EE_IDS);
            expect(list.className).toBe('ee-ach-panel__list');
        });

        it('handles all undiscovered', () => {
            const list = buildItemList(eeManager, t, EE_IDS);
            expect(list.querySelectorAll('.ee-ach-item--found')).toHaveLength(0);
            expect(list.querySelectorAll('.ee-ach-item--locked')).toHaveLength(18);
        });
    });

    describe('createPanelDom', () => {
        it('returns overlay and closeBtn', () => {
            const result = createPanelDom(eeManager, t, () => 5, 18, EE_IDS);
            expect(result.overlay).toBeInstanceOf(HTMLDivElement);
            expect(result.closeBtn).toBeInstanceOf(HTMLButtonElement);
        });

        it('creates panel overlay with correct class', () => {
            const { overlay } = createPanelDom(eeManager, t, () => 0, 18, EE_IDS);
            expect(overlay.className).toBe('ee-ach-panel-overlay');
            expect(overlay.querySelector('.ee-ach-panel')).not.toBeNull();
        });

        it('creates title with translated text', () => {
            createPanelDom(eeManager, t, () => 0, 18, EE_IDS);
            expect(t).toHaveBeenCalledWith('ee_ach_panel_title');
        });

        it('creates counter with count text', () => {
            const { overlay } = createPanelDom(eeManager, t, () => 5, 18, EE_IDS);
            const counter = overlay.querySelector('.ee-ach-panel__count');
            expect(counter).not.toBeNull();
            expect(t).toHaveBeenCalledWith('ee_ach_found');
        });

        it('creates close button with translated text', () => {
            createPanelDom(eeManager, t, () => 0, 18, EE_IDS);
            expect(t).toHaveBeenCalledWith('ee_ach_panel_close');
        });

        it('includes item list inside panel', () => {
            const { overlay } = createPanelDom(eeManager, t, () => 0, 18, EE_IDS);
            const items = overlay.querySelectorAll('.ee-ach-item');
            expect(items).toHaveLength(18);
        });
    });

    describe('attachPanel', () => {
        it('appends panel to body and returns overlay', () => {
            const onClose = vi.fn();
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            const overlay = attachPanel(eeManager, t, listen, () => 5, 18, EE_IDS, onClose);
            expect(overlay).toBeInstanceOf(HTMLDivElement);
            expect(document.querySelector('.ee-ach-panel')).not.toBeNull();
        });

        it('calls onClose when close button is clicked', () => {
            const onClose = vi.fn();
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            attachPanel(eeManager, t, listen, () => 5, 18, EE_IDS, onClose);
            document.querySelector('.ee-ach-panel__close').click();
            expect(onClose).toHaveBeenCalled();
        });

        it('calls onClose when overlay is clicked directly', () => {
            const onClose = vi.fn();
            const listeners = [];
            const listen = (target, event, handler) => {
                target.addEventListener(event, handler);
                listeners.push({ target, event, handler });
            };
            attachPanel(eeManager, t, listen, () => 5, 18, EE_IDS, onClose);
            document.querySelector('.ee-ach-panel-overlay').click();
            expect(onClose).toHaveBeenCalled();
        });
    });
});
