import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

// SPEC GAP: response body for GET /api/health is not fixed in tech.md section 10.
// Deploy and docker-compose read `status`, so it stays stable until the contract lands.
export const GET: RequestHandler = async () => {
	try {
		await db.execute(sql`select 1`);
		return json({ status: 'ok', db: 'up' });
	} catch {
		return json({ status: 'degraded', db: 'down' }, { status: 503 });
	}
};
