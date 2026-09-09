import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { enqueue, getBoss, stopBoss } from '$lib/server/queue/boss';
import { QUEUES } from '$lib/server/queue/contracts';
import { handleDemoPing, handledPings, resetHandledPings } from '$lib/server/queue/jobs/demo-ping';

// Checklist item from tech.md section 16: pg-boss runs a job out of the worker. This
// exercises the same registration the worker process performs.

const payload = { at: '2027-06-12T15:00:00+03:00', note: 'ci round trip' };

async function waitForPing(timeoutMs = 15_000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (handledPings().length > 0) return;
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error('demo.ping was never handled');
}

beforeAll(async () => {
	resetHandledPings();
	const boss = await getBoss();
	await boss.work(QUEUES.demoPing, { batchSize: 5, pollingIntervalSeconds: 1 }, handleDemoPing);
}, 60_000);

afterAll(async () => {
	await stopBoss();
});

describe('demo.ping through pg-boss', () => {
	it('travels from enqueue to handler', async () => {
		await enqueue(QUEUES.demoPing, payload);
		await waitForPing();
		expect(handledPings()[0]).toMatchObject(payload);
	});

	it('leaves one effect when the same payload is queued twice', async () => {
		await enqueue(QUEUES.demoPing, payload);
		await new Promise((resolve) => setTimeout(resolve, 3000));
		expect(handledPings()).toHaveLength(1);
	});

	it('refuses to enqueue a payload the contract rejects', async () => {
		await expect(enqueue(QUEUES.demoPing, { note: 'no timestamp' })).rejects.toThrow();
	});
});
