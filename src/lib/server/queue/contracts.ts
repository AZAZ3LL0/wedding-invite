import { z } from 'zod';
import { templateId } from '$lib/server/telegram/templates';

/**
 * Every payload that crosses the queue is declared here and parsed by the handler
 * before anything else. Types are inferred from these schemas, never written twice.
 */

export const notificationKind = z.enum([
	'link_confirm',
	'rsvp_m1',
	'rsvp_w1',
	'rsvp_final',
	'day_before',
	'admin_alert'
]);

export const remindersScanPayload = z.object({});

export const remindersSendPayload = z.object({
	inviteId: z.uuid(),
	kind: notificationKind,
	dedupeKey: z.string().min(1)
});

export const telegramSendPayload = z.object({
	chatId: z.number().int(),
	template: templateId,
	params: z.record(z.string(), z.union([z.string(), z.number()])),
	dedupeKey: z.string().min(1),
	inviteId: z.uuid()
});

export const adminNotifyPayload = z.object({
	type: z.string().min(1),
	inviteId: z.uuid(),
	summary: z.string().min(1)
});

// SPEC GAP: stage 0 needs a job the worker can actually run before the reminder
// slice exists. Remove together with this schema once stage 4 lands.
export const demoPingPayload = z.object({
	at: z.iso.datetime({ offset: true }),
	note: z.string().min(1).max(200)
});

export const QUEUES = {
	remindersScan: 'reminders.scan',
	remindersSend: 'reminders.send',
	telegramSend: 'telegram.send',
	adminNotify: 'admin.notify',
	demoPing: 'demo.ping'
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const payloads = {
	[QUEUES.remindersScan]: remindersScanPayload,
	[QUEUES.remindersSend]: remindersSendPayload,
	[QUEUES.telegramSend]: telegramSendPayload,
	[QUEUES.adminNotify]: adminNotifyPayload,
	[QUEUES.demoPing]: demoPingPayload
} as const;

export type RemindersScanPayload = z.infer<typeof remindersScanPayload>;
export type RemindersSendPayload = z.infer<typeof remindersSendPayload>;
export type TelegramSendPayload = z.infer<typeof telegramSendPayload>;
export type AdminNotifyPayload = z.infer<typeof adminNotifyPayload>;
export type DemoPingPayload = z.infer<typeof demoPingPayload>;

/** Retry policy per topic, straight from tech.md section 6.1. */
export const retryPolicy: Record<
	QueueName,
	{ retryLimit: number; retryBackoff: boolean; expireInSeconds?: number }
> = {
	[QUEUES.remindersScan]: { retryLimit: 3, retryBackoff: true },
	[QUEUES.remindersSend]: { retryLimit: 5, retryBackoff: true, expireInSeconds: 300 },
	[QUEUES.telegramSend]: { retryLimit: 5, retryBackoff: true },
	[QUEUES.adminNotify]: { retryLimit: 3, retryBackoff: true },
	[QUEUES.demoPing]: { retryLimit: 1, retryBackoff: false }
};
