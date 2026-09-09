import { resolveCopy } from './copy';
import { siteBlocks } from './blocks';
import type { AddressForm, Audience, ResolvedBlock, SiteBlock } from './types';

/**
 * Server side segmentation, per tech.md section 4.4. A block whose audience does not
 * include the category is dropped here, before render, so it never reaches the HTML.
 * Hiding a block with CSS is not an option.
 *
 * An empty audience is forbidden by section 8, and a block with one would silently
 * disappear for everyone, so it fails loudly instead.
 */
export function blocksFor(category: Audience, blocks: SiteBlock[] = siteBlocks): SiteBlock[] {
	for (const block of blocks) {
		if (block.audience.length === 0) {
			throw new Error(`Content block ${block.id} declares an empty audience`);
		}
	}
	return blocks.filter((block) => block.audience.includes(category));
}

/** Segmentation and address form in one step: exactly what the page load returns. */
export function resolveBlocks(
	category: Audience,
	addressForm: AddressForm,
	blocks: SiteBlock[] = siteBlocks
): ResolvedBlock[] {
	return blocksFor(category, blocks).map(
		(block) =>
			({
				id: block.id,
				audience: block.audience,
				component: block.component,
				props: resolveCopy(block.props, addressForm)
			}) as ResolvedBlock
	);
}
