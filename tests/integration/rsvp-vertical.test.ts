import { execFileSync } from 'node:child_process';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db, pool } from '$lib/server/db';
import { guests, invites, rsvpEvents } from '$lib/server/db/schema';
import { loadInvite, markOpened } from '$lib/server/invites';
import { setRsvp } from '$lib/server/rsvp';

// The stage 0 vertical, end to end against a real database: open /[code], answer for
// one guest, see the row change. Acceptance criteria come from tech.md sections 4, 9
// and 10, not from the code under test.

const FAMILY = 'FAM4SEAT01';
const FRIEND = 'FRNDNAMED2';

beforeAll(() => {
	execFileSync('pnpm', ['db:migrate'], { stdio: 'inherit', shell: true });
	execFileSync('pnpm', ['db:seed'], { stdio: 'inherit', shell: true });
}, 120_000);

afterAll(async () => {
	await pool.end();
});

describe('guest invite page', () => {
	it('answers 404 shaped null for a code nobody was given', async () => {
		expect(await loadInvite('ZZZZZZZZZZ')).toBeNull();
		expect(await loadInvite('not-a-code')).toBeNull();
	});

	it('serves the invite behind the code', async () => {
		const loaded = await loadInvite(FAMILY);
		expect(loaded).not.toBeNull();
		expect(loaded?.view.greetingName).toBe('Семья Ивановых');
		expect(loaded?.view.seats).toBe(4);
		expect(loaded?.view.guests).toHaveLength(4);
	});

	it('keeps the admin comment out of what the page receives', async () => {
		const loaded = await loadInvite(FAMILY);
		expect(JSON.stringify(loaded?.view)).not.toContain('Тётя со стороны невесты');
	});

	it('carries no guest from a neighbouring invite', async () => {
		const loaded = await loadInvite(FAMILY);
		const names = loaded?.view.guests.map((guest) => guest.firstName) ?? [];
		expect(names).not.toContain('Дмитрий');
	});

	it('stamps the first open once and the last open every time', async () => {
		const loaded = await loadInvite(FAMILY);
		await markOpened(loaded!.id);
		const [first] = await db
			.select({ firstOpenedAt: invites.firstOpenedAt, lastOpenedAt: invites.lastOpenedAt })
			.from(invites)
			.where(eq(invites.id, loaded!.id));

		await markOpened(loaded!.id);
		const [second] = await db
			.select({ firstOpenedAt: invites.firstOpenedAt, lastOpenedAt: invites.lastOpenedAt })
			.from(invites)
			.where(eq(invites.id, loaded!.id));

		expect(second.firstOpenedAt?.toISOString()).toBe(first.firstOpenedAt?.toISOString());
		expect(second.lastOpenedAt!.getTime()).toBeGreaterThanOrEqual(first.lastOpenedAt!.getTime());
	});
});

describe('setRsvp', () => {
	it('writes the answer and appends an audit event', async () => {
		const loaded = await loadInvite(FAMILY);
		const guest = loaded!.view.guests[0];

		const result = await setRsvp(loaded!.id, { guestId: guest.id, status: 'accepted' });
		expect(result).toEqual({ ok: true, status: 'accepted' });

		const [row] = await db
			.select({ rsvp: guests.rsvp, rsvpAt: guests.rsvpAt })
			.from(guests)
			.where(eq(guests.id, guest.id));
		expect(row.rsvp).toBe('accepted');
		expect(row.rsvpAt).not.toBeNull();

		const events = await db
			.select({ type: rsvpEvents.type })
			.from(rsvpEvents)
			.where(and(eq(rsvpEvents.guestId, guest.id), eq(rsvpEvents.type, 'rsvp_set')));
		expect(events.length).toBeGreaterThan(0);
	});

	it('frees the seat when the guest declines', async () => {
		const before = await loadInvite(FAMILY);
		const guest = before!.view.guests[1];
		await setRsvp(before!.id, { guestId: guest.id, status: 'declined' });

		const after = await loadInvite(FAMILY);
		expect(after!.view.freeSeats).toBe(before!.view.freeSeats + 1);
	});

	it('refuses a guest that belongs to another invite', async () => {
		const family = await loadInvite(FAMILY);
		const friend = await loadInvite(FRIEND);
		const foreignGuest = friend!.view.guests[0];

		const result = await setRsvp(family!.id, { guestId: foreignGuest.id, status: 'declined' });
		expect(result).toEqual({ ok: false, reason: 'not_found' });

		const [row] = await db
			.select({ rsvp: guests.rsvp })
			.from(guests)
			.where(eq(guests.id, foreignGuest.id));
		expect(row.rsvp).toBe('accepted');
	});

	it('marks the invite complete only once nobody is pending', async () => {
		const loaded = await loadInvite(FRIEND);
		const guest = loaded!.view.guests[0];
		await setRsvp(loaded!.id, { guestId: guest.id, status: 'accepted' });

		const [row] = await db
			.select({ rsvpCompletedAt: invites.rsvpCompletedAt })
			.from(invites)
			.where(eq(invites.id, loaded!.id));
		expect(row.rsvpCompletedAt).not.toBeNull();
	});
});
