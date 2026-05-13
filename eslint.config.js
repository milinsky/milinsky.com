import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'eqeqeq': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    {
        ignores: ['dist/', 'node_modules/', 'coverage/'],
    },
];
