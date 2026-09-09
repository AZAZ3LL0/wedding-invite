import { enqueue, getBoss, stopBoss } from '../src/lib/server/queue/boss';
import { QUEUES } from '../src/lib/server/queue/contracts';
import { handleDemoPing } from '../src/lib/server/queue/jobs/demo-ping';

/**
 * The queue process. It runs separately from the web app so a slow Telegram call
 * never holds a request open.
 */
async function main(): Promise<void> {
	const boss = await getBoss();

	await boss.work(QUEUES.demoPing, { batchSize: 5 }, handleDemoPing);

	// Proves the round trip on every start: enqueue, pick up, log.
	await enqueue(QUEUES.demoPing, {
		at: new Date().toISOString(),
		note: 'worker started'
	});

	console.log('worker ready');
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		void stopBoss().then(() => process.exit(0));
	});
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
