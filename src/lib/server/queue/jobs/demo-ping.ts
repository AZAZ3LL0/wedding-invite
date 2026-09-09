import type PgBoss from 'pg-boss';
import { demoPingPayload, QUEUES } from '../contracts';

// SPEC GAP: demo job that proves the worker picks work up end to end. It is removed
// when the reminder slice replaces it in stage 4.

export interface DemoPingRecord {
	at: string;
	note: string;
	handledAt: string;
}

// Keyed by payload, so a retried or duplicated job leaves exactly one record. Every
// handler in this project follows the same shape, see tech.md section 6.3.
const handled = new Map<string, DemoPingRecord>();

export function handledPings(): DemoPingRecord[] {
	return [...handled.values()];
}

export function resetHandledPings(): void {
	handled.clear();
}

export async function handleDemoPing(jobs: PgBoss.Job<unknown>[]): Promise<void> {
	for (const job of jobs) {
		const payload = demoPingPayload.parse(job.data);
		const key = `${payload.at}:${payload.note}`;
		if (handled.has(key)) continue;
		handled.set(key, { ...payload, handledAt: new Date().toISOString() });
		console.log(`[${QUEUES.demoPing}] ${payload.note} (queued at ${payload.at})`);
	}
}
