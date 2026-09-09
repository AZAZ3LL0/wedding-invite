import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode for project files. Libraries keep their own mode.
		runes: ({ filename }) => (filename.includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		typescript: {
			// The worker process lives outside src/ but shares the same strictness.
			config(cfg) {
				cfg.include.push('../worker/**/*.ts');
				return cfg;
			}
		}
	}
};

export default config;
