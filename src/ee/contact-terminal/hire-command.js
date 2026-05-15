const SCAN_STEP_MS = 600;

export function runHireCommand(
    shell,
    t,
    reducedMotion,
    schedule,
    appendLine,
    appendElement,
    listen,
    onDestroyed,
    runMailComposer
) {
    const steps = [t('contact_hire_scanning'), t('contact_hire_checking'), t('contact_hire_generating')];

    if (reducedMotion) {
        for (const step of steps) {
            appendLine('> ' + step, 'contact-nf__hint');
        }
        showContract();
        return;
    }

    let i = 0;
    function nextStep() {
        if (onDestroyed() || i >= steps.length) {
            showContract();
            return;
        }
        appendLine('> ' + steps[i], 'contact-nf__hint');
        i++;
        schedule(nextStep, SCAN_STEP_MS);
    }
    nextStep();

    function showContract() {
        if (onDestroyed()) return;

        const PAD = 2;
        const MIN_WIDTH = 42;
        const header = 'COLLABORATION PROPOSAL';
        const contentLines = [
            'Status: ' + t('contact_hire_status'),
            'Response: ' + t('contact_hire_response'),
            t('contact_hire_open'),
            t('contact_hire_notopen'),
        ];
        const allTexts = [header, ...contentLines];
        const textWidth = Math.max(...allTexts.map((s) => s.length));
        const innerWidth = Math.max(MIN_WIDTH, textWidth + PAD * 2);
        const divider = '─'.repeat(innerWidth);
        const border = (text) => '│' + ' '.repeat(PAD) + text + ' '.repeat(innerWidth - text.length - PAD) + '│';
        const box = document.createElement('div');
        box.className = 'contact-hire__box';
        box.textContent = [
            '┌' + divider + '┐',
            border(header),
            '├' + divider + '┤',
            ...contentLines.map(border),
            '└' + divider + '┘',
        ].join('\n');
        appendElement(box);

        const optionsLine = document.createElement('div');
        optionsLine.style.marginTop = 'var(--space-sm)';

        const emailOption = document.createElement('span');
        emailOption.className = 'contact-hire__option';
        emailOption.textContent = '[e] Email';
        emailOption.setAttribute('tabindex', '0');
        emailOption.setAttribute('role', 'button');

        const separator = document.createElement('span');
        separator.textContent = '  /  ';

        const tgOption = document.createElement('span');
        tgOption.className = 'contact-hire__option';
        tgOption.textContent = '[t] Telegram';
        tgOption.setAttribute('tabindex', '0');
        tgOption.setAttribute('role', 'button');

        optionsLine.appendChild(emailOption);
        optionsLine.appendChild(separator);
        optionsLine.appendChild(tgOption);
        appendElement(optionsLine);

        listen(emailOption, 'click', () => {
            if (!onDestroyed()) runMailComposer();
        });
        listen(emailOption, 'keydown', (e) => {
            if (!onDestroyed() && e.key === 'Enter') runMailComposer();
        });
        listen(tgOption, 'click', () => {
            if (!onDestroyed()) window.open('https://t.me/milinsky', '_blank');
        });
        listen(tgOption, 'keydown', (e) => {
            if (!onDestroyed() && e.key === 'Enter') window.open('https://t.me/milinsky', '_blank');
        });
    }
}
