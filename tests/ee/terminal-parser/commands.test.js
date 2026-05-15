import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCommands } from '../../../src/ee/terminal-parser/commands.js';
import { getDailyPassword } from '../../../src/ee/terminal-parser/utils.js';

describe('terminal-parser/commands', () => {
    let commands;
    const mockT = (key) => key;
    const mockSeed = 0.5;

    beforeEach(() => {
        commands = createCommands({ t: mockT, sessionSeed: mockSeed });
    });

    describe('state queries', () => {
        it('isExitPending returns false initially', () => {
            expect(commands.isExitPending()).toBe(false);
        });

        it('isSecretPending returns false initially', () => {
            expect(commands.isSecretPending()).toBe(false);
        });

        it('isExitPending returns true after exit command', () => {
            commands.execute('exit');
            expect(commands.isExitPending()).toBe(true);
        });

        it('isSecretPending returns true after secret command', () => {
            commands.execute('secret');
            expect(commands.isSecretPending()).toBe(true);
        });
    });

    describe('command outputs', () => {
        it('help returns text with command list', () => {
            const result = commands.execute('help');
            expect(result.text).toContain('Available commands');
            expect(result.text).toContain('help');
            expect(result.text).toContain('sudo');
            expect(result.text).toContain('exit');
            expect(result.text).toContain('whoami');
            expect(result.text).toContain('ls');
            expect(result.text).toContain('cat');
            expect(result.text).toContain('secret');
            expect(result.text).toContain('neofetch');
            expect(result.discover).toBe(true);
        });

        it('whoami returns text with visitor prefix', () => {
            const result = commands.execute('whoami');
            expect(result.text).toContain('visitor_');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('ls returns text with file listing', () => {
            const result = commands.execute('ls');
            expect(result).toHaveProperty('text');
            expect(result.text).toContain('projects/');
            expect(result.text).toContain('coffee.md');
            expect(result.discover).toBe(true);
        });

        it('hello returns text', () => {
            const result = commands.execute('hello');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('pineapple returns text', () => {
            const result = commands.execute('pineapple');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('rm -rf / returns text', () => {
            const result = commands.execute('rm -rf /');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('sudo without args returns text', () => {
            const result = commands.execute('sudo');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('sudo make me a sandwich returns sandwich art', () => {
            const result = commands.execute('sudo make me a sandwich');
            expect(result.text).toContain('Ok.');
            expect(result.text).toContain('HAM');
            expect(result.text).toContain('BREAD');
            expect(result.discover).toBe(true);
        });

        it('cat with coffee.md returns text with coffee content', () => {
            const result = commands.execute('cat coffee.md');
            expect(result).toHaveProperty('text');
            expect(result.discover).toBe(true);
        });

        it('cat with secrets.enc returns encrypted hint', () => {
            const result = commands.execute('cat secrets.enc');
            expect(result.text).toContain('AES-256-CBC encrypted');
            expect(result.text).toContain('**');
        });

        it('cat with non-existing file returns error text', () => {
            const result = commands.execute('cat nosuch.txt');
            expect(result.text).toContain('No such file');
        });

        it('cat without args returns usage', () => {
            const result = commands.execute('cat');
            expect(result.text).toContain('Usage');
        });

        it('unknown command returns error indication', () => {
            const result = commands.execute('foobar');
            expect(result).toHaveProperty('text');
            expect(result.text).toContain('ee_term_unknown');
        });

        it('neofetch returns element and discover', () => {
            const result = commands.execute('neofetch');
            expect(result.element).toBeInstanceOf(HTMLElement);
            expect(result.discover).toBe(true);
        });
    });

    describe('secret flow', () => {
        it('secret then correct password returns access granted text', () => {
            commands.execute('secret');
            expect(commands.isSecretPending()).toBe(true);

            const password = getDailyPassword();
            const result = commands.execute(password);
            expect(result.text).toBe('ee_term_secret_correct');
            expect(result.discover).toBe(true);
            expect(commands.isSecretPending()).toBe(false);
        });

        it('secret then wrong password returns access denied text', () => {
            commands.execute('secret');
            expect(commands.isSecretPending()).toBe(true);

            const result = commands.execute('wrongpass');
            expect(result.text).toBe('ee_term_secret_wrong');
            expect(commands.isSecretPending()).toBe(false);
        });
    });

    describe('exit flow', () => {
        it('exit sets exitPending and returns confirmation prompt', () => {
            const result = commands.execute('exit');
            expect(commands.isExitPending()).toBe(true);
            expect(result.text).toBe('ee_term_exit');
            expect(result.dim).toBe(true);
        });

        it('exit then Y shows no escape message and resets pending', () => {
            commands.execute('exit');
            const result = commands.execute('Y');
            expect(result.text).toBe('ee_term_exit_confirm');
            expect(commands.isExitPending()).toBe(false);
        });

        it('exit then N shows aborted and resets pending', () => {
            commands.execute('exit');
            const result = commands.execute('N');
            expect(result.text).toBe('Aborted.');
            expect(commands.isExitPending()).toBe(false);
        });

        it('exit then other input shows aborted and resets pending', () => {
            commands.execute('exit');
            const result = commands.execute('maybe');
            expect(result.text).toBe('Aborted.');
            expect(commands.isExitPending()).toBe(false);
        });
    });

    describe('isolation between instances', () => {
        it('separate instances have independent exit state', () => {
            const cmds1 = createCommands({ t: mockT, sessionSeed: mockSeed });
            const cmds2 = createCommands({ t: mockT, sessionSeed: mockSeed });

            cmds1.execute('exit');
            expect(cmds1.isExitPending()).toBe(true);
            expect(cmds2.isExitPending()).toBe(false);
        });

        it('separate instances have independent secret state', () => {
            const cmds1 = createCommands({ t: mockT, sessionSeed: mockSeed });
            const cmds2 = createCommands({ t: mockT, sessionSeed: mockSeed });

            cmds1.execute('secret');
            expect(cmds1.isSecretPending()).toBe(true);
            expect(cmds2.isSecretPending()).toBe(false);
        });
    });
});
