import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { mockApi } from './mock/mockApi.ts'

const useMock = process.env.MOCK_API === '1'
const apiTarget = `http://localhost:${process.env.API_PORT ?? '5080'}`

export default defineConfig({
  plugins: [vue(), ...(useMock ? [mockApi()] : [])],
  server: {
    port: 5173,
    strictPort: true,
    proxy: useMock
      ? undefined
      : {
          '/trades': apiTarget,
          '/positions': apiTarget,
        },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/test/**', 'src/**/*.test.ts', 'src/**/*.d.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
})
