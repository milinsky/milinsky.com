const TOTAL_EE_COUNT = 18;
const HUNTER_THRESHOLD = 5;

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

export { TOTAL_EE_COUNT, EE_IDS };

/**
 * Achievement system that tracks discovered easter eggs.
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createAchievements(ctx) {
    const { eeManager, t } = ctx;

    const listeners = [];
    let destroyed = false;
    let hunterShown = false;
    let perfectionistShown = false;
    let panelEl = null;
    let modalEl = null;
    let badgeEl = null;

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    function countDiscovered() {
        let count = 0;
        for (const id of EE_IDS) {
            if (eeManager.isDiscovered(id)) count++;
        }
        return count;
    }

    function onDiscover() {
        if (destroyed) return;
        const count = countDiscovered();

        if (count >= HUNTER_THRESHOLD && !hunterShown) {
            hunterShown = true;
            showBadge();
        }

        updateBadgeCount();

        if (count >= TOTAL_EE_COUNT && !perfectionistShown) {
            perfectionistShown = true;
            showPerfectionistModal();
        }
    }

    function showBadge() {
        if (badgeEl) return;

        const footer = document.querySelector('.footer');
        if (!footer) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'ee-ach-badge';

        const content = document.createElement('div');
        content.className = 'ee-ach-badge__content';

        const label = document.createElement('span');
        label.className = 'ee-ach-badge__label';
        label.textContent = t('ee_ach_hunter_badge');

        const counter = document.createElement('span');
        counter.className = 'ee-ach-badge__counter';
        counter.textContent = countDiscovered() + '/' + TOTAL_EE_COUNT;

        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'ee-ach-badge__toggle';
        collapseBtn.textContent = '×';
        collapseBtn.title = t('ee_ach_badge_collapse');
        listen(collapseBtn, 'click', () => collapseBadge());

        content.appendChild(label);
        content.appendChild(counter);
        content.appendChild(collapseBtn);
        wrapper.appendChild(content);

        const expandBtn = document.createElement('button');
        expandBtn.className = 'ee-ach-badge__expand';
        expandBtn.textContent = '⬡';
        expandBtn.title = t('ee_ach_badge_expand');
        listen(expandBtn, 'click', () => expandBadge());
        wrapper.appendChild(expandBtn);

        const footerInner = footer.querySelector('.footer__inner');
        if (footerInner) {
            footerInner.style.position = 'relative';
            footerInner.appendChild(wrapper);
        } else {
            footer.style.position = 'relative';
            footer.appendChild(wrapper);
        }
        badgeEl = wrapper;
    }

    function collapseBadge() {
        if (!badgeEl) return;
        badgeEl.classList.add('ee-ach-badge--collapsed');
    }

    function expandBadge() {
        if (!badgeEl) return;
        badgeEl.classList.remove('ee-ach-badge--collapsed');
    }

    function updateBadgeCount() {
        if (!badgeEl) return;
        const counter = badgeEl.querySelector('.ee-ach-badge__counter');
        if (counter) {
            counter.textContent = countDiscovered() + '/' + TOTAL_EE_COUNT;
        }
    }

    function showPerfectionistModal() {
        if (modalEl) return;

        const overlay = document.createElement('div');
        overlay.className = 'ee-ach-modal-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ee-ach-modal';

        const header = document.createElement('div');
        header.className = 'ee-ach-modal__header';
        header.textContent = t('ee_ach_perfectionist');

        const body = document.createElement('div');
        body.className = 'ee-ach-modal__body';

        const text = document.createElement('p');
        text.className = 'ee-ach-modal__text';
        text.textContent = t('ee_ach_modal_text');

        const link = document.createElement('a');
        link.className = 'ee-ach-modal__link';
        link.href = 'https://milinsky.dev';
        link.textContent = t('ee_ach_modal_link');

        const close = document.createElement('button');
        close.className = 'ee-ach-modal__close';
        close.textContent = t('ee_ach_panel_close');

        listen(close, 'click', () => {
            overlay.remove();
            modalEl = null;
        });

        body.appendChild(text);
        body.appendChild(link);
        body.appendChild(close);
        dialog.appendChild(header);
        dialog.appendChild(body);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        modalEl = overlay;
    }

    function showPanel() {
        if (panelEl) return;

        const overlay = document.createElement('div');
        overlay.className = 'ee-ach-panel-overlay';

        const panel = document.createElement('div');
        panel.className = 'ee-ach-panel';

        const title = document.createElement('div');
        title.className = 'ee-ach-panel__title';
        title.textContent = t('ee_ach_panel_title');

        const counter = document.createElement('div');
        counter.className = 'ee-ach-panel__count';
        counter.textContent = t('ee_ach_found')
            .replace('{n}', String(countDiscovered()))
            .replace('{total}', String(TOTAL_EE_COUNT));

        const list = document.createElement('div');
        list.className = 'ee-ach-panel__list';

        for (const id of EE_IDS) {
            const found = eeManager.isDiscovered(id);
            const item = document.createElement('div');
            item.className = 'ee-ach-item' + (found ? ' ee-ach-item--found' : ' ee-ach-item--locked');

            const icon = document.createElement('span');
            icon.className = 'ee-ach-item__icon';
            icon.textContent = found ? '[+]' : '[ ]';

            const name = document.createElement('span');
            name.className = 'ee-ach-item__name';
            name.textContent = t('ee_ach_name_' + id.replace(/-/g, '_'));

            item.appendChild(icon);
            item.appendChild(name);
            list.appendChild(item);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'ee-ach-panel__close';
        closeBtn.textContent = t('ee_ach_panel_close');

        listen(closeBtn, 'click', () => {
            window.location.hash = '';
            hidePanel();
        });

        listen(overlay, 'click', (e) => {
            if (e.target === overlay) {
                window.location.hash = '';
                hidePanel();
            }
        });

        panel.appendChild(title);
        panel.appendChild(counter);
        panel.appendChild(list);
        panel.appendChild(closeBtn);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        panelEl = overlay;
    }

    function hidePanel() {
        if (panelEl) {
            panelEl.remove();
            panelEl = null;
        }
    }

    function onHashChange() {
        if (destroyed) return;
        if (window.location.hash === '#achievements') {
            showPanel();
        } else {
            hidePanel();
        }
    }

    eeManager.discover('ee08');

    const originalDiscover = eeManager.discover;
    eeManager.discover = function wrappedDiscover(id) {
        const wasNew = !eeManager.isDiscovered(id);
        originalDiscover.call(eeManager, id);
        if (wasNew) onDiscover();
    };

    listen(window, 'hashchange', onHashChange);

    onDiscover();

    if (window.location.hash === '#achievements') {
        showPanel();
    }

    return {
        destroy() {
            destroyed = true;
            eeManager.discover = originalDiscover;
            if (panelEl) {
                panelEl.remove();
                panelEl = null;
            }
            if (modalEl) {
                modalEl.remove();
                modalEl = null;
            }
            if (badgeEl) {
                badgeEl.remove();
                badgeEl = null;
            }
            for (const l of listeners) {
                l.target.removeEventListener(l.event, l.handler);
            }
        },
    };
}
