import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/,   // only matches the login file
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'storageState.chromium.json',
      },
      testMatch: /.*\.spec\.ts/,        // only matches spec files
      dependencies: ['setup'],
    },
  ],
});
