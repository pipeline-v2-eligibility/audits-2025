import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        testTimeout: 20000,
        setupFiles: './vitest.setup.ts',
        fileParallelism: false,
        reporters: [
            'json'
        ]
    },
});