import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'node',
		include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
		// Integration files share one database and one queue, so they run one at a time.
		fileParallelism: false,
		globals: false
	}
});
