import { defineConfig, devices } from '@playwright/test';

// Mobile traffic is the main case, so the default project is a phone viewport.
export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	projects: [
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }
	],
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
