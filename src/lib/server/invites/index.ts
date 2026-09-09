import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	guestAnswers,
	guests,
	invites,
	rsvpEvents,
	seatRequests,
	telegramChats
} from '$lib/server/db/schema';
import { config } from '$lib/server/config';
import { freeSeats } from '$lib/server/rsvp/seats';
import { isValidInviteCode, normalizeInviteCode } from './code';
import type { AnswerValue, GuestView, InviteView } from '$lib/types';

export interface LoadedInvite {
	id: string;
	view: InviteView;
}

// An unknown code must not be cheaper to probe than a known one.
const MIN_LOOKUP_MS = 120;

async function withMinimumDelay<T>(started: number, value: T): Promise<T> {
	const remaining = MIN_LOOKUP_MS - (Date.now() - started);
	if (remaining > 0) {
		await new Promise((resolve) => setTimeout(resolve, remaining));
	}
	return value;
}

/**
 * The only entry point for the guest page. Returns null for anything the caller
 * should answer with 404: malformed code, unknown code.
 *
 * adminComment is never selected here. It is not filtered out later, it never leaves
 * the database in the first place.
 */
export async function loadInvite(rawCode: string): Promise<LoadedInvite | null> {
	const started = Date.now();
	const code = normalizeInviteCode(rawCode);
	if (!isValidInviteCode(code)) {
		return withMinimumDelay(started, null);
	}

	const [invite] = await db
		.select({
			id: invites.id,
			code: invites.code,
			greetingName: invites.greetingName,
			category: invites.category,
			addressForm: invites.addressForm,
			seats: invites.seats,
			plusOnePolicy: invites.plusOnePolicy,
			personalNote: invites.personalNote
		})
		.from(invites)
		.where(eq(invites.code, code))
		.limit(1);

	if (!invite) {
		return withMinimumDelay(started, null);
	}

	const guestRows = await db
		.select({
			id: guests.id,
			firstName: guests.firstName,
			lastName: guests.lastName,
			origin: guests.origin,
			ageGroup: guests.ageGroup,
			rsvp: guests.rsvp,
			isPrimary: guests.isPrimary,
			addedByGuestId: guests.addedByGuestId
		})
		.from(guests)
		.where(eq(guests.inviteId, invite.id))
		.orderBy(asc(guests.isPrimary), asc(guests.createdAt));

	const guestIds = guestRows.map((guest) => guest.id);
	const answerRows = guestIds.length
		? await db
				.select({
					guestId: guestAnswers.guestId,
					questionKey: guestAnswers.questionKey,
					value: guestAnswers.value
				})
				.from(guestAnswers)
				.where(inArray(guestAnswers.guestId, guestIds))
		: [];

	const answersByGuest = new Map<string, Record<string, AnswerValue>>();
	for (const row of answerRows) {
		const bucket = answersByGuest.get(row.guestId) ?? {};
		bucket[row.questionKey] = row.value;
		answersByGuest.set(row.guestId, bucket);
	}

	const [chat] = await db
		.select({ id: telegramChats.id })
		.from(telegramChats)
		.where(and(eq(telegramChats.inviteId, invite.id), eq(telegramChats.isBlocked, false)))
		.limit(1);

	const [pending] = await db
		.select({
			id: seatRequests.id,
			extraSeats: seatRequests.extraSeats,
			comment: seatRequests.comment,
			status: seatRequests.status
		})
		.from(seatRequests)
		.where(and(eq(seatRequests.inviteId, invite.id), eq(seatRequests.status, 'pending')))
		.limit(1);

	const guestViews: GuestView[] = guestRows.map((guest) => ({
		...guest,
		answers: answersByGuest.get(guest.id) ?? {}
	}));

	const view: InviteView = {
		code: invite.code,
		greetingName: invite.greetingName,
		category: invite.category,
		addressForm: invite.addressForm,
		seats: invite.seats,
		freeSeats: freeSeats(invite.seats, guestViews),
		plusOnePolicy: invite.plusOnePolicy,
		personalNote: invite.personalNote,
		guests: guestViews,
		telegramLinked: Boolean(chat),
		rsvpLocked: Date.now() > config.rsvpLockAt.getTime(),
		pendingSeatRequest: pending ?? null
	};

	return withMinimumDelay(started, { id: invite.id, view });
}

/**
 * Records the visit. firstOpenedAt is written once, so the organisers can tell
 * "never opened the link" from "opened it and went quiet".
 */
export async function markOpened(inviteId: string): Promise<void> {
	const now = new Date();
	await db
		.update(invites)
		.set({ lastOpenedAt: now, firstOpenedAt: sql`coalesce(${invites.firstOpenedAt}, ${now})` })
		.where(eq(invites.id, inviteId));
	await db.insert(rsvpEvents).values({
		inviteId,
		actor: 'guest',
		type: 'invite_opened',
		payload: { at: now.toISOString() }
	});
}

/** Resolves the invite id for a code, for actions that already passed the page guard. */
export async function findInviteIdByCode(rawCode: string): Promise<string | null> {
	const code = normalizeInviteCode(rawCode);
	if (!isValidInviteCode(code)) return null;
	const [invite] = await db
		.select({ id: invites.id })
		.from(invites)
		.where(eq(invites.code, code))
		.limit(1);
	return invite?.id ?? null;
}
