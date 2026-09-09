import type { GuestView, RsvpStatus } from '$lib/types';

/**
 * A declined guest releases the seat, a pending one still holds it: the restaurant
 * count has to assume everyone who has not said no is coming.
 */
export function freeSeats(seats: number, guests: Pick<GuestView, 'rsvp'>[]): number {
	const taken = guests.filter((guest) => guest.rsvp !== 'declined').length;
	return Math.max(0, seats - taken);
}

export function takenSeats(guests: Pick<GuestView, 'rsvp'>[]): number {
	return guests.filter((guest) => guest.rsvp !== 'declined').length;
}

export const RSVP_STATUSES: readonly RsvpStatus[] = ['pending', 'accepted', 'declined'];
