import { sql } from 'drizzle-orm';
import {
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import type { AnswerValue } from '$lib/types';

export const audienceEnum = pgEnum('audience', ['family', 'friends', 'colleagues']);
export const addressFormEnum = pgEnum('address_form', ['ty', 'vy']);
export const plusOneEnum = pgEnum('plus_one_policy', ['none', 'named', 'open']);
export const rsvpEnum = pgEnum('rsvp_status', ['pending', 'accepted', 'declined']);
export const guestOriginEnum = pgEnum('guest_origin', ['preset', 'companion']);
export const ageGroupEnum = pgEnum('age_group', ['adult', 'teen', 'child']);
export const seatReqEnum = pgEnum('seat_request_status', ['pending', 'approved', 'rejected']);
export const actorEnum = pgEnum('actor', ['guest', 'admin', 'bot', 'system']);
export const questionTypeEnum = pgEnum('question_type', ['single', 'multi', 'text']);
export const notifyKindEnum = pgEnum('notification_kind', [
	'link_confirm',
	'rsvp_m1',
	'rsvp_w1',
	'rsvp_final',
	'day_before',
	'admin_alert'
]);

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
};

export const invites = pgTable(
	'invites',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		code: text('code').notNull().unique(),
		partyId: uuid('party_id'),
		greetingName: text('greeting_name').notNull(),
		category: audienceEnum('category').notNull(),
		addressForm: addressFormEnum('address_form').notNull().default('vy'),
		seats: integer('seats').notNull().default(1),
		plusOnePolicy: plusOneEnum('plus_one_policy').notNull().default('none'),
		personalNote: text('personal_note'),
		adminComment: text('admin_comment'),
		firstOpenedAt: timestamp('first_opened_at', { withTimezone: true }),
		lastOpenedAt: timestamp('last_opened_at', { withTimezone: true }),
		rsvpCompletedAt: timestamp('rsvp_completed_at', { withTimezone: true }),
		...timestamps
	},
	(table) => [
		index('invites_party_id_idx').on(table.partyId),
		index('invites_category_idx').on(table.category)
	]
);

export const guests = pgTable(
	'guests',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		inviteId: uuid('invite_id')
			.notNull()
			.references(() => invites.id, { onDelete: 'cascade' }),
		firstName: text('first_name'),
		lastName: text('last_name'),
		origin: guestOriginEnum('origin').notNull(),
		addedByGuestId: uuid('added_by_guest_id'),
		isPrimary: boolean('is_primary').notNull().default(false),
		ageGroup: ageGroupEnum('age_group').notNull().default('adult'),
		rsvp: rsvpEnum('rsvp').notNull().default('pending'),
		rsvpAt: timestamp('rsvp_at', { withTimezone: true }),
		seatConfirmed: boolean('seat_confirmed').notNull().default(true),
		// Mirrors normalizeName() in lib/server/rsvp/names.ts. Kept in the database so the
		// duplicate guard is a constraint, not a race between two concurrent requests.
		normalizedName: text('normalized_name').generatedAlwaysAs(
			sql`btrim(regexp_replace(translate(lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), 'ё-''ʼ’', 'е'), '[[:space:]]+', ' ', 'g'))`
		),
		...timestamps
	},
	(table) => [
		index('guests_invite_id_idx').on(table.inviteId),
		index('guests_rsvp_idx').on(table.rsvp),
		// Guests with no name yet (plusOnePolicy 'open') are exempt: they duplicate nobody
		// until they are named.
		uniqueIndex('guests_invite_normalized_name_uq')
			.on(table.inviteId, table.normalizedName)
			.where(sql`first_name is not null`)
	]
);

export const questions = pgTable('questions', {
	key: text('key').primaryKey(),
	type: questionTypeEnum('type').notNull(),
	title: text('title').notNull(),
	hint: text('hint'),
	options: jsonb('options').$type<{ value: string; label: string }[]>().notNull().default([]),
	audience: audienceEnum('audience').array().notNull(),
	appliesTo: ageGroupEnum('applies_to').array().notNull(),
	required: boolean('required').notNull().default(false),
	sort: integer('sort').notNull().default(0),
	...timestamps
});

export const guestAnswers = pgTable(
	'guest_answers',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		guestId: uuid('guest_id')
			.notNull()
			.references(() => guests.id, { onDelete: 'cascade' }),
		questionKey: text('question_key')
			.notNull()
			.references(() => questions.key),
		value: jsonb('value').$type<AnswerValue>().notNull(),
		...timestamps
	},
	(table) => [uniqueIndex('guest_answers_guest_question_uq').on(table.guestId, table.questionKey)]
);

export const seatRequests = pgTable('seat_requests', {
	id: uuid('id').primaryKey().defaultRandom(),
	inviteId: uuid('invite_id')
		.notNull()
		.references(() => invites.id, { onDelete: 'cascade' }),
	requestedByGuestId: uuid('requested_by_guest_id')
		.notNull()
		.references(() => guests.id, { onDelete: 'cascade' }),
	extraSeats: integer('extra_seats').notNull(),
	comment: text('comment'),
	status: seatReqEnum('status').notNull().default('pending'),
	decidedAt: timestamp('decided_at', { withTimezone: true }),
	decidedBy: text('decided_by'),
	...timestamps
});

export const telegramChats = pgTable('telegram_chats', {
	id: uuid('id').primaryKey().defaultRandom(),
	chatId: bigint('chat_id', { mode: 'number' }).notNull().unique(),
	inviteId: uuid('invite_id')
		.notNull()
		.references(() => invites.id, { onDelete: 'cascade' }),
	username: text('username'),
	tgFirstName: text('tg_first_name'),
	linkedAt: timestamp('linked_at', { withTimezone: true }).notNull().defaultNow(),
	isBlocked: boolean('is_blocked').notNull().default(false),
	lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
	...timestamps
});

export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey().defaultRandom(),
	inviteId: uuid('invite_id')
		.notNull()
		.references(() => invites.id, { onDelete: 'cascade' }),
	chatId: bigint('chat_id', { mode: 'number' }),
	kind: notifyKindEnum('kind').notNull(),
	dedupeKey: text('dedupe_key').notNull().unique(),
	scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
	sentAt: timestamp('sent_at', { withTimezone: true }),
	telegramMessageId: bigint('telegram_message_id', { mode: 'number' }),
	attempts: integer('attempts').notNull().default(0),
	lastError: text('last_error'),
	...timestamps
});

export const rsvpEvents = pgTable(
	'rsvp_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		inviteId: uuid('invite_id')
			.notNull()
			.references(() => invites.id, { onDelete: 'cascade' }),
		guestId: uuid('guest_id').references(() => guests.id, { onDelete: 'set null' }),
		actor: actorEnum('actor').notNull(),
		type: text('type').notNull(),
		payload: jsonb('payload').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('rsvp_events_invite_id_idx').on(table.inviteId)]
);

export const adminSessions = pgTable('admin_sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	tokenHash: text('token_hash').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdIp: text('created_ip'),
	...timestamps
});
