import { beforeEach, describe, expect, it } from 'vitest';
import type PgBoss from 'pg-boss';
import {
	handleDemoPing,
	handledPings,
	resetHandledPings
} from '../../src/lib/server/queue/jobs/demo-ping';

function job(data: unknown): PgBoss.Job<unknown> {
	return { id: 'job-1', name: 'demo.ping', data } as PgBoss.Job<unknown>;
}

beforeEach(() => {
	resetHandledPings();
});

// Every handler carries an idempotency test, per tech.md section 6.3.
describe('demo.ping handler', () => {
	it('records one effect per payload', async () => {
		const payload = { at: '2027-06-12T15:00:00+03:00', note: 'worker started' };
		await handleDemoPing([job(payload)]);
		expect(handledPings()).toHaveLength(1);
	});

	it('leaves one effect after a repeated run', async () => {
		const payload = { at: '2027-06-12T15:00:00+03:00', note: 'worker started' };
		await handleDemoPing([job(payload)]);
		await handleDemoPing([job(payload)]);
		expect(handledPings()).toHaveLength(1);
	});

	it('refuses a payload the contract does not describe', async () => {
		await expect(handleDemoPing([job({ note: 'no timestamp' })])).rejects.toThrow();
		expect(handledPings()).toHaveLength(0);
	});
});
