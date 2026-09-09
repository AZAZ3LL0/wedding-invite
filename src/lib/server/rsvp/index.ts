import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { guests, invites, rsvpEvents } from '$lib/server/db/schema';
import { config } from '$lib/server/config';
import type { RsvpStatus } from '$lib/types';

export const setRsvpInput = z.object({
	guestId: z.uuid(),
	status: z.enum(['pending', 'accepted', 'declined'])
});

export type SetRsvpInput = z.infer<typeof setRsvpInput>;

export type SetRsvpResult =
	{ ok: true; status: RsvpStatus } | { ok: false; reason: 'not_found' | 'locked' };

/**
 * Sets one guest's answer. Ownership of the guest by the invite from the URL is
 * checked first, before anything is read or written: a guest id from another
 * invite must fail as "not found", not as "forbidden".
 */
export async function setRsvp(inviteId: string, input: SetRsvpInput): Promise<SetRsvpResult> {
	const [guest] = await db
		.select({ id: guests.id })
		.from(guests)
		.where(and(eq(guests.id, input.guestId), eq(guests.inviteId, inviteId)))
		.limit(1);
	if (!guest) return { ok: false, reason: 'not_found' };

	if (Date.now() > config.rsvpLockAt.getTime()) {
		return { ok: false, reason: 'locked' };
	}

	const now = new Date();
	await db
		.update(guests)
		.set({ rsvp: input.status, rsvpAt: now, updatedAt: now })
		.where(eq(guests.id, guest.id));

	await db.insert(rsvpEvents).values({
		inviteId,
		guestId: guest.id,
		actor: 'guest',
		type: 'rsvp_set',
		payload: { status: input.status }
	});

	await refreshRsvpCompletion(inviteId, now);

	return { ok: true, status: input.status };
}

/** An invite counts as complete once no guest is left on 'pending'. */
async function refreshRsvpCompletion(inviteId: string, now: Date): Promise<void> {
	const [stillPending] = await db
		.select({ id: guests.id })
		.from(guests)
		.where(and(eq(guests.inviteId, inviteId), eq(guests.rsvp, 'pending')))
		.limit(1);

	await db
		.update(invites)
		.set({ rsvpCompletedAt: stillPending ? null : now, updatedAt: now })
		.where(eq(invites.id, inviteId));
}

/** Counts the guests of an invite that hold a seat. Used by the seat maths and tests. */
export async function countHeldSeats(inviteId: string): Promise<number> {
	const rows = await db
		.select({ id: guests.id })
		.from(guests)
		.where(and(eq(guests.inviteId, inviteId), ne(guests.rsvp, 'declined')));
	return rows.length;
}
