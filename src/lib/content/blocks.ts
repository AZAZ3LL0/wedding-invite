import { contactsBlocks } from './contacts';
import { dressCodeBlocks } from './dress-code';
import { faqBlocks } from './faq';
import { heroBlocks } from './hero';
import { invitationBlocks } from './invitation';
import { loveStoryBlocks } from './love-story';
import { timelineBlocks } from './timeline';
import { venueBlocks } from './venue';
import type { SiteBlock } from './types';

/**
 * The whole site in reading order. Array position is the render order; the audience
 * filter only removes blocks, it never reorders them.
 */
export const siteBlocks: SiteBlock[] = [
	...heroBlocks,
	...invitationBlocks,
	...timelineBlocks,
	...loveStoryBlocks,
	...dressCodeBlocks,
	...venueBlocks,
	...faqBlocks,
	...contactsBlocks
];
