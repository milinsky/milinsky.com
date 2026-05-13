import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            thresholds: {
                statements: 95,
                branches: 90,
                functions: 95,
                lines: 95,
            },
            include: ['src/**/*.js'],
        },
        setupFiles: ['./tests/setup.js'],
    },
});
