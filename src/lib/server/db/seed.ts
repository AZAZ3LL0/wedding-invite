import { randomUUID } from 'node:crypto';
import { db, pool } from './index';
import { guests, invites, questions, seatRequests, telegramChats } from './schema';
import { inviteFixtures, questionFixtures } from './fixtures';

/**
 * Rewrites the fixture set. Invites cascade, so deleting them clears guests, chats,
 * seat requests and events with them. Safe to run repeatedly on a development
 * database, never pointed at production.
 */
async function seed(): Promise<void> {
	await db.delete(invites);
	await db.delete(questions);

	await db.insert(questions).values(questionFixtures);

	const partyIds = new Map<string, string>();

	for (const fixture of inviteFixtures) {
		let partyId: string | null = null;
		if (fixture.partyKey) {
			partyId = partyIds.get(fixture.partyKey) ?? randomUUID();
			partyIds.set(fixture.partyKey, partyId);
		}

		const [invite] = await db
			.insert(invites)
			.values({
				code: fixture.code,
				partyId,
				greetingName: fixture.greetingName,
				category: fixture.category,
				addressForm: fixture.addressForm,
				seats: fixture.seats,
				plusOnePolicy: fixture.plusOnePolicy,
				personalNote: fixture.personalNote,
				adminComment: fixture.adminComment
			})
			.returning({ id: invites.id });

		const insertedGuests = await db
			.insert(guests)
			.values(
				fixture.guests.map((guest) => ({
					inviteId: invite.id,
					firstName: guest.firstName,
					lastName: guest.lastName,
					origin: guest.origin,
					isPrimary: guest.isPrimary,
					ageGroup: guest.ageGroup,
					rsvp: guest.rsvp,
					rsvpAt: guest.rsvp === 'pending' ? null : new Date()
				}))
			)
			.returning({ id: guests.id });

		if (fixture.chat) {
			await db.insert(telegramChats).values({
				chatId: fixture.chat.chatId,
				inviteId: invite.id,
				username: fixture.chat.username,
				tgFirstName: fixture.chat.tgFirstName,
				isBlocked: fixture.chat.isBlocked,
				linkedAt: new Date()
			});
		}

		if (fixture.seatRequest) {
			await db.insert(seatRequests).values({
				inviteId: invite.id,
				requestedByGuestId: insertedGuests[0].id,
				extraSeats: fixture.seatRequest.extraSeats,
				comment: fixture.seatRequest.comment
			});
		}
	}

	console.log(`seeded ${inviteFixtures.length} invites`);
}

await seed();
await pool.end();
