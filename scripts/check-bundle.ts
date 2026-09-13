import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Guest page JavaScript budget from tech.md section 1: under 130 KB gzip.
 *
 * Lighthouse measures the same thing over a network and is noisy about it. This check
 * reads the built files instead, so a regression fails the same way on every machine.
 * It sums the whole client bundle, which is at least what the guest page loads.
 */

const BUDGET_BYTES = 130 * 1024;
const CLIENT_DIR = '.svelte-kit/output/client';

async function jsFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const found: string[] = [];
	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...(await jsFiles(path)));
		else if (entry.name.endsWith('.js')) found.push(path);
	}
	return found;
}

const files = await jsFiles(CLIENT_DIR);
if (files.length === 0) {
	throw new Error(`No client JavaScript under ${CLIENT_DIR}. Run pnpm build first.`);
}

let total = 0;
const rows: { file: string; gzip: number }[] = [];
for (const file of files) {
	const gzip = gzipSync(await readFile(file)).length;
	total += gzip;
	rows.push({ file, gzip });
}

rows.sort((a, b) => b.gzip - a.gzip);
for (const row of rows.slice(0, 5)) {
	console.log(`${(row.gzip / 1024).toFixed(1)} KB  ${row.file}`);
}

const used = (total / 1024).toFixed(1);
const budget = (BUDGET_BYTES / 1024).toFixed(0);
if (total > BUDGET_BYTES) {
	console.error(`client javascript ${used} KB gzip is over the ${budget} KB budget`);
	process.exit(1);
}
console.log(`client javascript ${used} KB gzip, budget ${budget} KB`);
