import { defineConfig, devices } from '@playwright/test'

const PORT = 5273

export default defineConfig({
  testDir: 'e2e/specs',
  testMatch: '**/*.e2e.ts',
  use: { baseURL: `http://localhost:${PORT}`, locale: 'en-US', timezoneId: 'UTC' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
})
