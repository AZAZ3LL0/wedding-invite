import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

// Body shape is fixed by tech.md section 10. The container healthcheck, the deploy
// step and external monitoring all read `status`, so it does not change casually.
export const GET: RequestHandler = async () => {
	try {
		await db.execute(sql`select 1`);
		return json({ status: 'ok', db: 'up' });
	} catch {
		return json({ status: 'degraded', db: 'down' }, { status: 503 });
	}
};
