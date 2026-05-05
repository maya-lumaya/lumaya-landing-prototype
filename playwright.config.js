import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3333',
    viewport: { width: 390, height: 844 }, // iPhone 14 (mobile)
  },
  webServer: {
    command: 'npx http-server -p 3333 -c-1',
    port: 3333,
    reuseExistingServer: true,
  },
});
