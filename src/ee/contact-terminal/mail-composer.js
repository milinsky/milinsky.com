import { sendMessage } from './send-message.js';

const MAIL_PROMPT_DELAY_MS = 400;
const SEND_CMD = '/send';

export function runMailComposer(shell, t, reducedMotion, schedule, appendLine, appendElement, listen, onDestroyed) {
    if (onDestroyed()) return;

    appendLine('> ' + t('contact_mail_opening'), 'contact-nf__hint');
    schedule(promptSubject, reducedMotion ? 0 : MAIL_PROMPT_DELAY_MS);

    function buildComposerUI(labelText) {
        const line = document.createElement('div');

        const label = document.createElement('span');
        label.className = 'contact-mail__field';
        label.textContent = labelText;
        line.appendChild(label);

        const input = document.createElement('span');
        input.className = 'contact-mail__input';
        input.setAttribute('tabindex', '0');
        input.setAttribute('role', 'textbox');
        line.appendChild(input);

        const cursor = document.createElement('span');
        cursor.className = 'contact-cursor';
        line.appendChild(cursor);

        appendElement(line);
        input.focus();

        return { line, input, cursor };
    }

    function promptSubject() {
        if (onDestroyed()) return;

        const { line, input, cursor } = buildComposerUI(t('contact_mail_subject_prompt') + ': ');

        let buffer = '';

        listen(input, 'keydown', (e) => {
            if (onDestroyed()) return;
            e.preventDefault();

            if (e.key === 'Enter') {
                cursor.remove();
                const subject = buffer;
                schedule(() => promptMessage(subject), reducedMotion ? 0 : MAIL_PROMPT_DELAY_MS);
                return;
            }

            if (e.key === 'Backspace') {
                buffer = buffer.slice(0, -1);
                input.textContent = buffer;
                return;
            }

            if (e.key.length === 1) {
                buffer += e.key;
                input.textContent = buffer;
            }
        });

        listen(line, 'click', () => {
            if (!onDestroyed()) input.focus();
        });
    }

    function promptMessage(subject) {
        if (onDestroyed()) return;

        const hintLine = document.createElement('div');
        hintLine.className = 'contact-nf__hint';
        hintLine.textContent = '> ' + t('contact_mail_send_hint');
        appendElement(hintLine);

        const { line, input, cursor } = buildComposerUI(t('contact_mail_message_prompt') + ': ');

        let buffer = '';

        listen(input, 'keydown', (e) => {
            if (onDestroyed()) return;
            e.preventDefault();

            if (e.key === 'Escape') {
                cursor.remove();
                appendLine('> Cancelled.', 'contact-nf__hint');
                return;
            }

            if (e.key === 'Enter') {
                const trimmed = buffer.replace(/\s+$/, '');
                if (trimmed.endsWith(SEND_CMD)) {
                    cursor.remove();
                    const messageBody = trimmed.slice(0, -SEND_CMD.length).trim();
                    handleSend(subject, messageBody);
                    return;
                }
                buffer += '\n';
                input.textContent += '\n';
                shell.scrollTop = shell.scrollHeight;
                return;
            }

            if (e.key === 'Backspace') {
                buffer = buffer.slice(0, -1);
                input.textContent = buffer;
                return;
            }

            if (e.key.length === 1) {
                buffer += e.key;
                input.textContent += e.key;
            }
        });

        listen(line, 'click', () => {
            if (!onDestroyed()) input.focus();
        });
    }

    function showConfirmation() {
        appendLine('✓ ' + t('contact_mail_success'), 'contact-mail__success');
    }

    async function handleSend(subject, body) {
        if (onDestroyed()) return;

        appendLine('> ' + t('contact_mail_sending'), 'contact-nf__hint');

        const ok = await sendMessage(subject, body);
        if (onDestroyed()) return;

        if (ok) {
            showConfirmation();
        } else {
            const errorLine = document.createElement('div');
            errorLine.className = 'contact-mail__error';
            errorLine.textContent = '✗ ' + t('contact_mail_error');
            appendElement(errorLine);

            const mailLink = document.createElement('a');
            mailLink.className = 'contact-hire__option';
            mailLink.href = 'mailto:hello@milinsky.com';
            mailLink.textContent = 'hello@milinsky.com';
            appendElement(mailLink);
        }
    }
}
