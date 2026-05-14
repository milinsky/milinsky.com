import { getDailyPassword, formatSessionId } from './utils.js';

const SANDWICH_ART = [
    '   /*\\     ',
    '  |   |    ',
    '  |HAM|    ',
    '  |   |    ',
    '  \\ */    ',
    '  /   \\   ',
    ' /BREAD\\  ',
];

let secretAwaitingInput = false;

export function createCommands(t, sessionSeed) {
    const sessionId = formatSessionId(sessionSeed);
    const dailyPassword = getDailyPassword();
    let exitPending = false;

    function cmdHelp() {
        const lines = [
            'Available commands:',
            '  help     - Show this message',
            '  sudo     - Try elevated access',
            '  exit     - Exit terminal',
            '  whoami   - Who are you?',
            '  ls       - List files',
            '  cat      - Read a file',
            '  hello    - Say hi',
            '  secret   - Enter a password',
            '  pineapple - Hot take',
            '  rm -rf / - Try it',
            '',
            '  ~~secret~~',
        ];
        return { text: lines.join('\n'), discover: true };
    }

    function cmdSudo(args) {
        if (args === 'make me a sandwich') {
            return {
                text: 'Ok.\n\n' + SANDWICH_ART.join('\n'),
                discover: true,
            };
        }
        return { text: t('ee_term_sudo'), discover: true };
    }

    function cmdExit() {
        exitPending = true;
        return { text: t('ee_term_exit'), discover: true, dim: true };
    }

    function cmdExitConfirm(input) {
        exitPending = false;
        if (input === 'y' || input === 'Y') {
            return { text: t('ee_term_exit_confirm') };
        }
        return { text: 'Aborted.' };
    }

    function cmdWhoami() {
        return { text: 'visitor_' + sessionId, discover: true };
    }

    function cmdLs() {
        return { text: 'projects/  secrets.enc  todo.txt  coffee.md', discover: true };
    }

    function cmdCat(args) {
        if (args === 'coffee.md') {
            return {
                text: '  ( (\n   ) )\n .______.\n |      | ]\n \\______/\n' + t('ee_term_coffee'),
                discover: true,
            };
        }
        if (args === 'secrets.enc') {
            const hint = dailyPassword.slice(0, -2) + '**';
            return {
                text: 'AES-256-CBC encrypted\nDecryption key: ' + hint + '\nError: full key requires higher clearance.',
            };
        }
        if (args.length > 0) {
            return { text: 'cat: ' + args + ': No such file' };
        }
        return { text: 'Usage: cat <filename>' };
    }

    function cmdSecret() {
        secretAwaitingInput = true;
        return { text: t('ee_term_secret_prompt') };
    }

    function cmdSecretInput(input) {
        secretAwaitingInput = false;
        if (input === dailyPassword) {
            return { text: t('ee_term_secret_correct'), discover: true };
        }
        return { text: t('ee_term_secret_wrong') };
    }

    function cmdHello() {
        return { text: t('ee_term_hello'), discover: true };
    }

    function cmdRmrf() {
        return { text: t('ee_term_rmrf'), discover: true };
    }

    function cmdPineapple() {
        return { text: t('ee_term_pineapple'), discover: true };
    }

    function isExitPending() {
        return exitPending;
    }

    function isSecretPending() {
        return secretAwaitingInput;
    }

    function execute(rawInput) {
        const trimmed = rawInput.trim();

        if (exitPending) {
            return cmdExitConfirm(trimmed);
        }

        if (secretAwaitingInput) {
            return cmdSecretInput(trimmed);
        }

        if (trimmed === 'help') return cmdHelp();
        if (trimmed === 'sudo') return cmdSudo('');
        if (trimmed.startsWith('sudo ')) return cmdSudo(trimmed.slice(5));
        if (trimmed === 'exit') return cmdExit();
        if (trimmed === 'whoami') return cmdWhoami();
        if (trimmed === 'ls') return cmdLs();
        if (trimmed === 'cat') return cmdCat('');
        if (trimmed.startsWith('cat ')) return cmdCat(trimmed.slice(4));
        if (trimmed === 'secret') return cmdSecret();
        if (trimmed === 'hello') return cmdHello();
        if (trimmed === 'rm -rf /') return cmdRmrf();
        if (trimmed === 'pineapple') return cmdPineapple();

        return { text: t('ee_term_unknown').replace('{cmd}', trimmed) };
    }

    return { execute, isExitPending, isSecretPending };
}
