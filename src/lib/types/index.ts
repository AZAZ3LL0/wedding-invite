export type Audience = 'family' | 'friends' | 'colleagues';
export type AddressForm = 'ty' | 'vy';
export type RsvpStatus = 'pending' | 'accepted' | 'declined';
export type GuestOrigin = 'preset' | 'companion';
export type AgeGroup = 'adult' | 'teen' | 'child';
export type PlusOnePolicy = 'none' | 'named' | 'open';
export type SeatRequestStatus = 'pending' | 'approved' | 'rejected';

export type AnswerValue = string | string[] | null;

export interface GuestView {
	id: string;
	firstName: string | null;
	lastName: string | null;
	origin: GuestOrigin;
	ageGroup: AgeGroup;
	rsvp: RsvpStatus;
	isPrimary: boolean;
	addedByGuestId: string | null;
	answers: Record<string, AnswerValue>;
}

export interface SeatRequestView {
	id: string;
	extraSeats: number;
	comment: string | null;
	status: SeatRequestStatus;
}

export interface InviteView {
	code: string;
	greetingName: string;
	category: Audience;
	addressForm: AddressForm;
	seats: number;
	freeSeats: number;
	plusOnePolicy: PlusOnePolicy;
	personalNote: string | null;
	guests: GuestView[];
	telegramLinked: boolean;
	rsvpLocked: boolean;
	pendingSeatRequest: SeatRequestView | null;
}
