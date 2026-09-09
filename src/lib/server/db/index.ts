import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '$lib/server/config';
import * as schema from './schema';

// One pool per process. The app and the worker are separate processes and each
// opens its own, which is why the pool size stays small.
export const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });

export const db = drizzle(pool, { schema });

export type Db = typeof db;
export { schema };
