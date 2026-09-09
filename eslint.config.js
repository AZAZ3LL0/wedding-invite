import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			// Guest pages link out to maps and to Telegram. Route navigation still goes
			// through the resolve check.
			'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }]
		}
	},
	{
		// Server code must not reach the browser bundle. SvelteKit blocks $lib/server
		// imports from client modules; this rule catches relative escapes as well.
		files: ['src/**/*.ts', 'src/**/*.svelte'],
		ignores: [
			'src/lib/server/**',
			'src/hooks.server.ts',
			'src/**/*.server.ts',
			'src/**/+server.ts'
		],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/lib/server/**', '**/server/db/**'],
							message: 'Server modules stay on the server. Pass data through load and actions.'
						}
					]
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		ignores: [
			'node_modules/',
			'.svelte-kit/',
			'build/',
			'drizzle/',
			'test-results/',
			'playwright-report/'
		]
	}
);
