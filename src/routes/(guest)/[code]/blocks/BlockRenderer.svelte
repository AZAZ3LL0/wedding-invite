<script lang="ts">
	import { Reveal } from '$lib/ui';
	import type { ResolvedBlock } from '$lib/content';
	import ContactsBlock from './ContactsBlock.svelte';
	import DressCodeBlock from './DressCodeBlock.svelte';
	import FaqBlock from './FaqBlock.svelte';
	import HeroBlock from './HeroBlock.svelte';
	import InvitationBlock from './InvitationBlock.svelte';
	import LoveStoryBlock from './LoveStoryBlock.svelte';
	import TimelineBlock from './TimelineBlock.svelte';
	import VenueBlock from './VenueBlock.svelte';

	interface Props {
		block: ResolvedBlock;
		/** The invitation block addresses the guest by name. */
		greetingName: string;
		/** Only the invitation block uses it, but the renderer is the one place that has it. */
		personalNote: string | null;
	}

	let { block, greetingName, personalNote }: Props = $props();
</script>

{#if block.component === 'hero'}
	<HeroBlock props={block.props} />
{:else}
	<section id={block.id} class="block">
		<Reveal>
			{#if block.component === 'invitation'}
				<InvitationBlock props={block.props} {greetingName} {personalNote} />
			{:else if block.component === 'timeline'}
				<TimelineBlock props={block.props} />
			{:else if block.component === 'loveStory'}
				<LoveStoryBlock props={block.props} />
			{:else if block.component === 'dressCode'}
				<DressCodeBlock props={block.props} />
			{:else if block.component === 'venue'}
				<VenueBlock props={block.props} />
			{:else if block.component === 'faq'}
				<FaqBlock props={block.props} />
			{:else if block.component === 'contacts'}
				<ContactsBlock props={block.props} />
			{/if}
		</Reveal>
	</section>
{/if}

<style>
	.block {
		max-width: 40rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4);
		border-top: 1px solid var(--sage-100);
	}
</style>
