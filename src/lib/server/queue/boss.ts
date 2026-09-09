import PgBoss from 'pg-boss';
import { config } from '$lib/server/config';
import { QUEUES, payloads, retryPolicy, type QueueName } from './contracts';

let boss: PgBoss | null = null;

/**
 * pg-boss lives in the same Postgres as the domain data, so a job and the rows it
 * touches can share a transaction later without a second broker to keep alive.
 */
export async function getBoss(): Promise<PgBoss> {
	if (boss) return boss;
	const instance = new PgBoss({ connectionString: config.DATABASE_URL, schema: 'pgboss' });
	instance.on('error', (error) => console.error('[pg-boss]', error));
	await instance.start();
	for (const name of Object.values(QUEUES)) {
		await instance.createQueue(name);
	}
	boss = instance;
	return boss;
}

export async function stopBoss(): Promise<void> {
	if (!boss) return;
	await boss.stop({ graceful: true });
	boss = null;
}

/**
 * The only way to enqueue. Payload is validated on the way in as well as inside the
 * handler: a bad payload should fail in the request that produced it, not at 09:00
 * the next morning in the worker log.
 */
export async function enqueue<T extends QueueName>(
	name: T,
	payload: unknown,
	options: PgBoss.SendOptions = {}
): Promise<string | null> {
	const data = payloads[name].parse(payload);
	const instance = await getBoss();
	const { expireInSeconds, ...policy } = retryPolicy[name];
	return instance.send(name, data as object, {
		...policy,
		...(expireInSeconds ? { expireInSeconds } : {}),
		...options
	});
}
