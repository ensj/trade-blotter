import os from 'node:os'

export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/test/**',
    '!src/components/**',
  ],
  concurrency: Math.max(1, os.availableParallelism() - 1),
  incremental: true,
  incrementalFile: 'reports/stryker-incremental.json',
  ignoreStatic: true,
  reporters: ['html', 'clear-text', 'progress'],
  thresholds: { high: 80, low: 60, break: 50 },
}
