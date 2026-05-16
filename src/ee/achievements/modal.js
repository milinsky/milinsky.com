/**
 * Creates the perfectionist modal DOM tree.
 * @param {(key: string) => string} t
 * @returns {{ overlay: HTMLDivElement, closeBtn: HTMLButtonElement }}
 */
export function createModalDom(t) {
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

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ee-ach-modal__close';
    closeBtn.textContent = t('ee_ach_panel_close');

    body.appendChild(text);
    body.appendChild(link);
    body.appendChild(closeBtn);
    dialog.appendChild(header);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    return { overlay, closeBtn };
}

export function attachModal(t, listen, onClose) {
    const { overlay, closeBtn } = createModalDom(t);
    listen(closeBtn, 'click', () => {
        overlay.remove();
        onClose();
    });
    document.body.appendChild(overlay);
    return overlay;
}
