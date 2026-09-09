import { describe, expect, it } from 'vitest';
import { blocksFor, resolveBlocks, siteBlocks } from '$lib/content';
import type { Audience } from '$lib/types';
import type { SiteBlock } from '$lib/content';

/**
 * Acceptance for stage 1: the page a guest gets is decided by the invite category on
 * the server, and a guest never receives a block written for another audience.
 *
 * The expected lists below are written by hand from that criterion, not read off the
 * content modules. A block that quietly changes audience turns one of them red.
 */

const CATEGORIES: Audience[] = ['family', 'friends', 'colleagues'];

const EXPECTED: Record<Audience, string[]> = {
	family: [
		'hero',
		'invitation-family',
		'timeline-family',
		'love-story',
		'dress-code-close',
		'venue',
		'faq-family',
		'contacts'
	],
	friends: [
		'hero',
		'invitation-friends',
		'timeline-guests',
		'love-story',
		'dress-code-close',
		'venue',
		'faq-friends',
		'contacts'
	],
	colleagues: [
		'hero',
		'invitation-colleagues',
		'timeline-guests',
		'dress-code-colleagues',
		'venue',
		'faq-colleagues',
		'contacts'
	]
};

function ids(category: Audience): string[] {
	return blocksFor(category).map((block) => block.id);
}

describe('content segmentation', () => {
	it.each(CATEGORIES)('%s gets exactly the blocks written for it', (category) => {
		expect(ids(category)).toEqual(EXPECTED[category]);
	});

	it('never hands a guest a block written for another audience', () => {
		for (const category of CATEGORIES) {
			for (const block of blocksFor(category)) {
				expect(block.audience).toContain(category);
			}
		}
	});

	it('keeps a friend away from the family blocks', () => {
		const familyOnly = siteBlocks
			.filter((block) => block.audience.length === 1 && block.audience[0] === 'family')
			.map((block) => block.id);

		expect(familyOnly.length).toBeGreaterThan(0);
		expect(ids('friends')).not.toContain(familyOnly[0]);
		for (const id of familyOnly) {
			expect(ids('friends')).not.toContain(id);
			expect(ids('colleagues')).not.toContain(id);
		}
	});

	it('gives every category the blocks the stage promises', () => {
		for (const category of CATEGORIES) {
			const components = blocksFor(category).map((block) => block.component);
			expect(components).toEqual(
				expect.arrayContaining(['hero', 'invitation', 'timeline', 'venue', 'faq', 'contacts'])
			);
		}
	});

	it('keeps the authored reading order', () => {
		for (const category of CATEGORIES) {
			const selected = blocksFor(category);
			const positions = selected.map((block) => siteBlocks.indexOf(block));
			expect(positions).toEqual([...positions].sort((a, b) => a - b));
		}
	});

	it('gives every block a unique id', () => {
		const seen = siteBlocks.map((block) => block.id);
		expect(new Set(seen).size).toBe(seen.length);
	});

	it('refuses a block that nobody would ever see', () => {
		const broken: SiteBlock[] = [
			{ id: 'orphan', audience: [], component: 'venue', props: siteBlocks[0].props as never }
		];
		expect(() => blocksFor('family', broken)).toThrow(/orphan/);
	});

	it('leaves no address form pair in what reaches the page', () => {
		for (const category of CATEGORIES) {
			const serialised = JSON.stringify(resolveBlocks(category, 'vy'));
			expect(serialised).not.toMatch(/"ty":/);
			expect(serialised).not.toMatch(/"vy":/);
		}
	});
});
