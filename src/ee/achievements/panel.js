/**
 * Builds the achievement list items.
 * @param {{ isDiscovered: (id: string) => boolean }} eeManager
 * @param {(key: string) => string} t
 * @param {string[]} eeIds
 * @returns {HTMLDivElement}
 */
export function buildItemList(eeManager, t, eeIds) {
    const list = document.createElement('div');
    list.className = 'ee-ach-panel__list';

    for (const id of eeIds) {
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

    return list;
}

/**
 * Creates the achievement panel DOM tree.
 * @param {{ isDiscovered: (id: string) => boolean }} eeManager
 * @param {(key: string) => string} t
 * @param {() => number} countFn
 * @param {number} total
 * @param {string[]} eeIds
 * @returns {{ overlay: HTMLDivElement, closeBtn: HTMLButtonElement }}
 */
export function createPanelDom(eeManager, t, countFn, total, eeIds) {
    const overlay = document.createElement('div');
    overlay.className = 'ee-ach-panel-overlay';

    const panel = document.createElement('div');
    panel.className = 'ee-ach-panel';

    const title = document.createElement('div');
    title.className = 'ee-ach-panel__title';
    title.textContent = t('ee_ach_panel_title');

    const counter = document.createElement('div');
    counter.className = 'ee-ach-panel__count';
    counter.textContent = t('ee_ach_found').replace('{n}', String(countFn())).replace('{total}', String(total));

    const list = buildItemList(eeManager, t, eeIds);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ee-ach-panel__close';
    closeBtn.textContent = t('ee_ach_panel_close');

    panel.appendChild(title);
    panel.appendChild(counter);
    panel.appendChild(list);
    panel.appendChild(closeBtn);
    overlay.appendChild(panel);

    return { overlay, closeBtn };
}

export function attachPanel(eeManager, t, listen, countFn, total, eeIds, onClose) {
    const { overlay, closeBtn } = createPanelDom(eeManager, t, countFn, total, eeIds);
    listen(closeBtn, 'click', onClose);
    listen(overlay, 'click', (e) => {
        if (e.target === overlay) onClose();
    });
    document.body.appendChild(overlay);
    return overlay;
}
