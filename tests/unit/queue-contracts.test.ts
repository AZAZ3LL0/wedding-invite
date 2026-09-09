import { describe, expect, it } from 'vitest';
import {
	adminNotifyPayload,
	demoPingPayload,
	QUEUES,
	payloads,
	remindersSendPayload,
	retryPolicy,
	telegramSendPayload
} from '../../src/lib/server/queue/contracts';

const inviteId = '3f6b2c9e-3c4b-4a15-9f2a-0c2b6d3d1111';

// Contract tests at the seam, per tech.md section 13: a payload that does not parse
// must never reach a handler, and every declared topic must carry a schema and a
// retry policy.
describe('queue contracts', () => {
	it('accepts the documented reminder payload', () => {
		const payload = { inviteId, kind: 'rsvp_m1', dedupeKey: `${inviteId}:rsvp_m1` };
		expect(remindersSendPayload.parse(payload)).toEqual(payload);
	});

	it('rejects a reminder for a kind that is not in the schema', () => {
		expect(
			remindersSendPayload.safeParse({ inviteId, kind: 'maybe', dedupeKey: 'x' }).success
		).toBe(false);
	});

	it('rejects a reminder without a dedupe key', () => {
		expect(
			remindersSendPayload.safeParse({ inviteId, kind: 'rsvp_m1', dedupeKey: '' }).success
		).toBe(false);
	});

	it('accepts a telegram send with a known template', () => {
		const payload = {
			chatId: 100000001,
			template: 'rsvp_w1',
			params: { greetingName: 'Дмитрий', link: 'https://example.ru/FRNDNAMED2' },
			dedupeKey: `${inviteId}:rsvp_w1`,
			inviteId
		};
		expect(telegramSendPayload.parse(payload)).toEqual(payload);
	});

	it('rejects a telegram send with a template nobody declared', () => {
		expect(
			telegramSendPayload.safeParse({
				chatId: 1,
				template: 'freeform',
				params: {},
				dedupeKey: 'k',
				inviteId
			}).success
		).toBe(false);
	});

	it('rejects an admin notification without an invite', () => {
		expect(adminNotifyPayload.safeParse({ type: 'rsvp_set', summary: 'ok' }).success).toBe(false);
	});

	it('rejects a demo ping without a timezone aware timestamp', () => {
		expect(demoPingPayload.safeParse({ at: '2027-06-12 15:00', note: 'x' }).success).toBe(false);
		expect(demoPingPayload.safeParse({ at: '2027-06-12T15:00:00+03:00', note: 'x' }).success).toBe(
			true
		);
	});

	it('declares a schema and a retry policy for every topic', () => {
		for (const name of Object.values(QUEUES)) {
			expect(payloads[name]).toBeDefined();
			expect(retryPolicy[name].retryLimit).toBeGreaterThan(0);
		}
	});

	it('keeps the retry limits tech.md fixes', () => {
		expect(retryPolicy[QUEUES.remindersSend]).toMatchObject({
			retryLimit: 5,
			retryBackoff: true,
			expireInSeconds: 300
		});
		expect(retryPolicy[QUEUES.telegramSend].retryLimit).toBe(5);
		expect(retryPolicy[QUEUES.remindersScan].retryLimit).toBe(3);
		expect(retryPolicy[QUEUES.adminNotify].retryLimit).toBe(3);
	});
});
