import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { freeSeats, takenSeats } from '../../src/lib/server/rsvp/seats';
import type { RsvpStatus } from '../../src/lib/types';

const status = fc.constantFrom<RsvpStatus>('pending', 'accepted', 'declined');

// Acceptance criteria from tech.md sections 4.2 and 13: a declined guest gives the
// seat back, a pending one does not, and the counter never goes negative.
describe('seat counting', () => {
	it('holds a seat for everyone who has not declined', () => {
		const guests: { rsvp: RsvpStatus }[] = [
			{ rsvp: 'accepted' },
			{ rsvp: 'pending' },
			{ rsvp: 'declined' }
		];
		expect(takenSeats(guests)).toBe(2);
		expect(freeSeats(4, guests)).toBe(2);
	});

	it('never reports negative free seats', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 0, max: 20 }),
				fc.array(status, { maxLength: 30 }),
				(seats, statuses) => {
					const guests = statuses.map((rsvp) => ({ rsvp }));
					expect(freeSeats(seats, guests)).toBeGreaterThanOrEqual(0);
				}
			)
		);
	});

	it('never reports more free seats than the invite has', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 0, max: 20 }),
				fc.array(status, { maxLength: 30 }),
				(seats, statuses) => {
					const guests = statuses.map((rsvp) => ({ rsvp }));
					expect(freeSeats(seats, guests)).toBeLessThanOrEqual(seats);
				}
			)
		);
	});

	it('declining never takes a seat away and never frees more than one', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 1, max: 20 }),
				fc.array(status, { minLength: 1, maxLength: 20 }),
				(seats, statuses) => {
					const guests = statuses.map((rsvp) => ({ rsvp }));
					const before = freeSeats(seats, guests);
					const after = freeSeats(
						seats,
						guests.map((guest, index) => (index === 0 ? { rsvp: 'declined' as RsvpStatus } : guest))
					);
					expect(after).toBeGreaterThanOrEqual(before);
					expect(after).toBeLessThanOrEqual(before + 1);
				}
			)
		);
	});
});
