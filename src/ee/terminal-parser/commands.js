import { getDailyPassword, formatSessionId } from './utils.js';
import { createNeofetchElement } from '../neofetch.js';

const SANDWICH_ART = [
    '   /*\\     ',
    '  |   |    ',
    '  |HAM|    ',
    '  |   |    ',
    '  \\ */    ',
    '  /   \\   ',
    ' /BREAD\\  ',
];

/**
 * Creates command handler for the terminal parser.
 * @param {{ t: function, sessionSeed: number }} ctx
 * @returns {{ execute: function, isExitPending: function, isSecretPending: function }}
 */
export function createCommands({ t, sessionSeed }) {
    const sessionId = formatSessionId(sessionSeed);
    const dailyPassword = getDailyPassword();
    const state = { exitPending: false, secretAwaitingInput: false };

    const ctx = { t, sessionId, dailyPassword, state };

    function execute(rawInput) {
        const trimmed = rawInput.trim();
        if (state.exitPending) return cmdExitConfirm(trimmed, ctx);
        if (state.secretAwaitingInput) return cmdSecretInput(trimmed, ctx);
        return dispatchCommand(trimmed, ctx);
    }

    function isExitPending() {
        return state.exitPending;
    }

    function isSecretPending() {
        return state.secretAwaitingInput;
    }

    return { execute, isExitPending, isSecretPending };
}

function dispatchCommand(trimmed, ctx) {
    if (trimmed === 'help') return cmdHelp();
    if (trimmed === 'sudo') return cmdSudo('', ctx);
    if (trimmed.startsWith('sudo ')) return cmdSudo(trimmed.slice(5), ctx);
    if (trimmed === 'exit') return cmdExit(ctx);
    if (trimmed === 'whoami') return cmdWhoami(ctx);
    if (trimmed === 'ls') return cmdLs();
    if (trimmed === 'cat') return cmdCat('', ctx);
    if (trimmed.startsWith('cat ')) return cmdCat(trimmed.slice(4), ctx);
    if (trimmed === 'secret') return cmdSecret(ctx);
    if (trimmed === 'hello') return cmdHello(ctx);
    if (trimmed === 'rm -rf /') return cmdRmrf(ctx);
    if (trimmed === 'pineapple') return cmdPineapple(ctx);
    if (trimmed === 'neofetch') return cmdNeofetch();
    return { text: ctx.t('ee_term_unknown').replace('{cmd}', trimmed) };
}

function cmdHelp() {
    const lines = [
        'Available commands:',
        '  help      - Show this message',
        '  sudo      - Try elevated access',
        '  exit      - Exit terminal',
        '  whoami    - Who are you?',
        '  ls        - List files',
        '  cat       - Read a file',
        '  hello     - Say hi',
        '  secret    - Enter a password',
        '  pineapple - Hot take',
        '  neofetch  - System info',
        '  rm -rf /  - Try it',
        '',
        '  ~~secret~~',
    ];
    return { text: lines.join('\n'), discover: true };
}

function cmdSudo(args, ctx) {
    if (args === 'make me a sandwich') {
        return { text: 'Ok.\n\n' + SANDWICH_ART.join('\n'), discover: true };
    }
    return { text: ctx.t('ee_term_sudo'), discover: true };
}

function cmdExit(ctx) {
    ctx.state.exitPending = true;
    return { text: ctx.t('ee_term_exit'), discover: true, dim: true };
}

function cmdExitConfirm(input, ctx) {
    ctx.state.exitPending = false;
    if (input === 'y' || input === 'Y') {
        return { text: ctx.t('ee_term_exit_confirm') };
    }
    return { text: 'Aborted.' };
}

function cmdWhoami(ctx) {
    return { text: 'visitor_' + ctx.sessionId, discover: true };
}

function cmdLs() {
    return { text: 'projects/  secrets.enc  todo.txt  coffee.md', discover: true };
}

function cmdCat(args, ctx) {
    if (args === 'coffee.md') {
        return {
            text: '  ( (\n   ) )\n .______.\n |      | ]\n \\______/\n' + ctx.t('ee_term_coffee'),
            discover: true,
        };
    }
    if (args === 'secrets.enc') {
        const hint = ctx.dailyPassword.slice(0, -2) + '**';
        return {
            text: 'AES-256-CBC encrypted\nDecryption key: ' + hint + '\nError: full key requires higher clearance.',
        };
    }
    if (args.length > 0) return { text: 'cat: ' + args + ': No such file' };
    return { text: 'Usage: cat <filename>' };
}

function cmdSecret(ctx) {
    ctx.state.secretAwaitingInput = true;
    return { text: ctx.t('ee_term_secret_prompt') };
}

function cmdSecretInput(input, ctx) {
    ctx.state.secretAwaitingInput = false;
    if (input === ctx.dailyPassword) {
        return { text: ctx.t('ee_term_secret_correct'), discover: true };
    }
    return { text: ctx.t('ee_term_secret_wrong') };
}

function cmdHello(ctx) {
    return { text: ctx.t('ee_term_hello'), discover: true };
}

function cmdRmrf(ctx) {
    return { text: ctx.t('ee_term_rmrf'), discover: true };
}

function cmdPineapple(ctx) {
    return { text: ctx.t('ee_term_pineapple'), discover: true };
}

function cmdNeofetch() {
    return { element: createNeofetchElement(), discover: true };
}
