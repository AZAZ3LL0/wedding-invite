import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index';

// Deploy and CI both call this. Drizzle records applied migrations itself, so a
// repeated run against an up to date database is a no-op.
await migrate(db, { migrationsFolder: './drizzle' });
await pool.end();
console.log('migrations applied');
