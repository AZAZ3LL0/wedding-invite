import type { AddressForm, Audience } from '$lib/types';
import type { PaletteColor } from '$lib/ui/types';
import type { ImageName } from './generated/images';

/**
 * Content as code, per tech.md sections 8 and 8.1. ContentBlock is the upper bound
 * the core fixes; every block below narrows `component` and `props` together, so a
 * block cannot claim to be a timeline and carry FAQ props.
 *
 * Props are type aliases rather than interfaces on purpose: an interface is not
 * assignable to Record<string, unknown>, so ContentBlock would stop constraining them.
 */

export type BlockComponent =
	| 'hero'
	| 'countdown'
	| 'invitation'
	| 'timeline'
	| 'loveStory'
	| 'dressCode'
	| 'venue'
	| 'faq'
	| 'rsvp'
	| 'contacts';

export interface ContentBlock {
	id: string;
	audience: Audience[];
	component: BlockComponent;
	props: Record<string, unknown>;
}

/**
 * A text that reads differently under `ты` and `вы`, per tech.md section 4.4. Neutral
 * text stays a plain string, so only the sentences that actually change carry both
 * forms: a pair on every line doubles the edit and lets the two drift apart.
 */
export type Copy = string | { ty: string; vy: string };

/** Resolves every Copy pair inside a props type down to the picked string. */
export type Resolved<V> = V extends { ty: string; vy: string }
	? string
	: V extends readonly (infer Item)[]
		? Resolved<Item>[]
		: V extends object
			? { [K in keyof V]: Resolved<V[K]> }
			: V;

export type HeroProps = {
	eyebrow: Copy;
	names: string;
	/** Human readable date in Russian. The machine readable one lives in `dateTime`. */
	date: string;
	dateTime: string;
	place: string;
	image: ImageName;
	imageAlt: string;
};

export type InvitationProps = {
	title: Copy;
	lead: Copy;
	paragraphs: Copy[];
	signature: string;
};

export type TimelineEntry = {
	time: string;
	title: string;
	note?: string;
	mapUrl?: string;
};

export type TimelineProps = {
	title: Copy;
	intro?: Copy;
	entries: TimelineEntry[];
};

export type LoveStoryChapter = {
	id: string;
	year: string;
	title: string;
	text: Copy;
	image?: ImageName;
	imageAlt?: string;
};

export type LoveStoryProps = {
	title: Copy;
	chapters: LoveStoryChapter[];
};

export type DressCodeProps = {
	title: Copy;
	text: Copy;
	colors: PaletteColor[];
	avoid?: Copy;
};

export type VenueProps = {
	title: Copy;
	name: string;
	address: string;
	mapUrl: string;
	mapImage: ImageName;
	mapAlt: string;
	notes: Copy[];
};

export type FaqItem = {
	id: string;
	question: Copy;
	answer: Copy;
};

export type FaqProps = {
	title: Copy;
	items: FaqItem[];
};

export type ContactPerson = {
	name: string;
	role: string;
	phone: string;
	telegram?: string;
};

export type ContactsProps = {
	title: Copy;
	lead: Copy;
	people: ContactPerson[];
};

interface Block<C extends BlockComponent, P extends Record<string, unknown>> extends ContentBlock {
	component: C;
	props: P;
}

/** Every block stage 1 knows how to render, before the address form is applied. */
export type SiteBlock =
	| Block<'hero', HeroProps>
	| Block<'invitation', InvitationProps>
	| Block<'timeline', TimelineProps>
	| Block<'loveStory', LoveStoryProps>
	| Block<'dressCode', DressCodeProps>
	| Block<'venue', VenueProps>
	| Block<'faq', FaqProps>
	| Block<'contacts', ContactsProps>;

/** The same block after `t()` picked a form. This is what reaches the page. */
export type ResolvedBlock =
	| Block<'hero', Resolved<HeroProps>>
	| Block<'invitation', Resolved<InvitationProps>>
	| Block<'timeline', Resolved<TimelineProps>>
	| Block<'loveStory', Resolved<LoveStoryProps>>
	| Block<'dressCode', Resolved<DressCodeProps>>
	| Block<'venue', Resolved<VenueProps>>
	| Block<'faq', Resolved<FaqProps>>
	| Block<'contacts', Resolved<ContactsProps>>;

export type { AddressForm, Audience, ImageName };
