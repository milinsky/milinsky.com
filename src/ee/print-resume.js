const PRINT_BODY_CLASS = 'ee-printing';
const PRINT_RESUME_CLASS = 'ee-print-resume';

function createSection(parent, headingKey, t) {
    const heading = document.createElement('h2');
    heading.className = 'ee-print-resume__heading';
    heading.textContent = t(headingKey);
    parent.appendChild(heading);
    return heading;
}

function createLine(parent, text) {
    const line = document.createElement('p');
    line.className = 'ee-print-resume__line';
    line.textContent = text;
    parent.appendChild(line);
    return line;
}

function createDivider(parent) {
    const hr = document.createElement('hr');
    hr.className = 'ee-print-resume__divider';
    parent.appendChild(hr);
}

/**
 * Custom print resume easter egg (EE-12).
 * @param {{ eeManager: object, t: function }} ctx
 * @returns {{ destroy(): void, printResume(): void }}
 */
export function createPrintResume(ctx) {
    const { eeManager, t } = ctx;

    const listeners = [];
    let destroyed = false;

    function listen(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        listeners.push({ target, event, handler, options });
    }

    function buildResumeHTML() {
        const resume = document.createElement('div');
        resume.className = PRINT_RESUME_CLASS;
        const name = document.createElement('h1');
        name.className = 'ee-print-resume__name';
        name.textContent = 'MILINSKY';
        resume.appendChild(name);
        const role = document.createElement('p');
        role.className = 'ee-print-resume__role';
        role.textContent = t('ee_print_role');
        resume.appendChild(role);
        const contact = document.createElement('p');
        contact.className = 'ee-print-resume__contact';
        contact.textContent = 'hello@milinsky.com  |  t.me/milinsky';
        resume.appendChild(contact);
        createDivider(resume);
        createSection(resume, 'ee_print_experience_heading', t);
        createLine(resume, t('ee_print_exp1'));
        createLine(resume, t('ee_print_exp2'));
        createLine(resume, t('ee_print_exp3'));
        createDivider(resume);
        createSection(resume, 'ee_print_services_heading', t);
        createLine(resume, t('ee_print_svc1'));
        createLine(resume, t('ee_print_svc2'));
        createLine(resume, t('ee_print_svc3'));
        createLine(resume, t('ee_print_svc4'));
        createDivider(resume);
        createSection(resume, 'ee_print_results_heading', t);
        createLine(resume, t('ee_print_res1'));
        createLine(resume, t('ee_print_res2'));
        createLine(resume, t('ee_print_res3'));
        createLine(resume, t('ee_print_res4'));
        createDivider(resume);
        const footer = document.createElement('p');
        footer.className = 'ee-print-resume__footer';
        footer.textContent = t('ee_print_footer');
        resume.appendChild(footer);
        return resume;
    }

    function printResume() {
        if (destroyed) return;

        eeManager.discover('ee12');

        const resume = buildResumeHTML();
        document.body.appendChild(resume);
        document.body.classList.add(PRINT_BODY_CLASS);

        listen(window, 'afterprint', () => {
            document.body.classList.remove(PRINT_BODY_CLASS);
            resume.remove();
        });

        window.print();
    }

    return {
        destroy() {
            destroyed = true;
            for (const { target, event, handler, options } of listeners) {
                target.removeEventListener(event, handler, options);
            }
        },
        printResume,
    };
}
