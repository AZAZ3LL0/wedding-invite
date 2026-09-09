import type PgBoss from 'pg-boss';
import { demoPingPayload, QUEUES } from '../contracts';

// SPEC GAP: demo job that proves the worker picks work up end to end. It writes
// nothing and is removed when the reminder slice replaces it in stage 4.

export interface DemoPingRecord {
	at: string;
	note: string;
	handledAt: string;
}

/** Handled pings, exposed so the worker smoke test can assert on them. */
export const handledPings: DemoPingRecord[] = [];

export async function handleDemoPing(jobs: PgBoss.Job<unknown>[]): Promise<void> {
	for (const job of jobs) {
		const payload = demoPingPayload.parse(job.data);
		handledPings.push({ ...payload, handledAt: new Date().toISOString() });
		console.log(`[${QUEUES.demoPing}] ${payload.note} (queued at ${payload.at})`);
	}
}
