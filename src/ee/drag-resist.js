/**
 * EE-13: Drag Resist — CDE-style error dialog on dragstart.
 * @param {{ eeManager: object, t: function, showToast: function }} ctx
 * @returns {{ destroy(): void }}
 */
export function createDragResist(ctx) {
    const { eeManager, t, showToast } = ctx;

    const listeners = [];
    let discovered = false;

    function listen(target, event, handler) {
        target.addEventListener(event, handler);
        listeners.push({ target, event, handler });
    }

    function closeDialog(overlay) {
        overlay.remove();
    }

    function buildModal() {
        const overlay = document.createElement('div');
        overlay.className = 'ee-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'ee-drag-modal';

        const header = document.createElement('div');
        header.className = 'ee-drag-modal__header';
        header.textContent = t('ee_drag_title');

        const body = document.createElement('div');
        body.className = 'ee-drag-modal__body';
        const bodyText = t('ee_drag_body');
        for (const line of bodyText.split('\n')) {
            const p = document.createElement('div');
            p.textContent = line;
            body.appendChild(p);
        }

        const btnRow = document.createElement('div');
        btnRow.className = 'ee-drag-modal__buttons';

        const contactBtn = document.createElement('a');
        contactBtn.className = 'ee-drag-modal__btn';
        contactBtn.textContent = t('ee_drag_contact');
        contactBtn.href = 'mailto:hello@milinsky.dev';
        contactBtn.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'ee-drag-modal__btn';
        resumeBtn.textContent = t('ee_drag_resume');
        resumeBtn.type = 'button';
        resumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDialog(overlay);
            window.print();
        });

        const justBtn = document.createElement('button');
        justBtn.className = 'ee-drag-modal__btn';
        justBtn.textContent = t('ee_drag_just');
        justBtn.type = 'button';
        justBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDialog(overlay);
            showToast(t('ee_drag_response'));
        });

        btnRow.appendChild(contactBtn);
        btnRow.appendChild(resumeBtn);
        btnRow.appendChild(justBtn);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay) {
                closeDialog(overlay);
            }
        });
    }

    listen(document, 'dragstart', (e) => {
        e.preventDefault();
        if (!discovered) {
            eeManager.discover('ee13');
            discovered = true;
        }
        buildModal();
    });

    return {
        destroy() {
            for (const { target, event, handler } of listeners) {
                target.removeEventListener(event, handler);
            }
        },
    };
}
