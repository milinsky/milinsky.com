/**
 * Creates the hunter badge DOM tree.
 * @param {(key: string) => string} t
 * @param {() => number} countFn
 * @param {number} total
 * @returns {{ wrapper: HTMLDivElement, collapseBtn: HTMLButtonElement, expandBtn: HTMLButtonElement }}
 */
export function createBadgeDom(t, countFn, total) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ee-ach-badge';

    const content = document.createElement('div');
    content.className = 'ee-ach-badge__content';

    const label = document.createElement('span');
    label.className = 'ee-ach-badge__label';
    label.textContent = t('ee_ach_hunter_badge');

    const counter = document.createElement('span');
    counter.className = 'ee-ach-badge__counter';
    counter.textContent = countFn() + '/' + total;

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'ee-ach-badge__toggle';
    collapseBtn.textContent = '\u00d7';
    collapseBtn.title = t('ee_ach_badge_collapse');

    const expandBtn = document.createElement('button');
    expandBtn.className = 'ee-ach-badge__expand';
    expandBtn.textContent = '\u2b21';
    expandBtn.title = t('ee_ach_badge_expand');

    content.appendChild(label);
    content.appendChild(counter);
    content.appendChild(collapseBtn);
    wrapper.appendChild(content);
    wrapper.appendChild(expandBtn);

    return { wrapper, collapseBtn, expandBtn };
}

/**
 * @param {HTMLElement|null} badgeEl
 */
export function collapseBadge(badgeEl) {
    if (!badgeEl) return;
    badgeEl.classList.add('ee-ach-badge--collapsed');
}

/**
 * @param {HTMLElement|null} badgeEl
 */
export function expandBadge(badgeEl) {
    if (!badgeEl) return;
    badgeEl.classList.remove('ee-ach-badge--collapsed');
}

/**
 * @param {HTMLElement|null} badgeEl
 * @param {() => number} countFn
 * @param {number} total
 */
export function updateBadgeCount(badgeEl, countFn, total) {
    if (!badgeEl) return;
    const counter = badgeEl.querySelector('.ee-ach-badge__counter');
    if (counter) {
        counter.textContent = countFn() + '/' + total;
    }
}

/**
 * @param {HTMLElement|null} badgeEl
 * @param {(key: string) => string} t
 */
export function updateBadgeLanguage(badgeEl, t) {
    if (!badgeEl) return;
    const label = badgeEl.querySelector('.ee-ach-badge__label');
    if (label) label.textContent = t('ee_ach_hunter_badge');
    const collapseBtn = badgeEl.querySelector('.ee-ach-badge__toggle');
    if (collapseBtn) collapseBtn.title = t('ee_ach_badge_collapse');
    const expandBtn = badgeEl.querySelector('.ee-ach-badge__expand');
    if (expandBtn) expandBtn.title = t('ee_ach_badge_expand');
}

export function attachBadge(t, listen, countFn, total) {
    const footer = document.querySelector('.footer');
    if (!footer) return null;
    const { wrapper, collapseBtn, expandBtn } = createBadgeDom(t, countFn, total);
    listen(collapseBtn, 'click', () => collapseBadge(wrapper));
    listen(expandBtn, 'click', () => expandBadge(wrapper));
    const footerInner = footer.querySelector('.footer__inner');
    if (footerInner) {
        footerInner.style.position = 'relative';
        footerInner.appendChild(wrapper);
    } else {
        footer.style.position = 'relative';
        footer.appendChild(wrapper);
    }
    return wrapper;
}
