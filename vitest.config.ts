import { defineConfig } from 'vitest/config';

const statsOutputDir = process.env.TEST_STATS_DIR || '';
const statsFileName = `${statsOutputDir ? `${statsOutputDir}/` : ''}stats.json`;

export default defineConfig({
    test: {
        environment: 'node',
        testTimeout: 20000,
        fileParallelism: false,
        setupFiles: './vitest.setup.ts',
        reporters: [
            'json', 'default'
        ],
        outputFile: {
            json: statsFileName,
        }
    },
});