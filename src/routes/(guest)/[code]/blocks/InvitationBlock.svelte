<script lang="ts">
	import { Card } from '$lib/ui';
	import type { InvitationProps, Resolved } from '$lib/content';

	interface Props {
		props: Resolved<InvitationProps>;
		/** Paragraph written for this one link. Comes from the invite, not from content. */
		personalNote: string | null;
	}

	let { props, personalNote }: Props = $props();
</script>

<h2>{props.title}</h2>
<p class="lead">{props.lead}</p>
{#each props.paragraphs as paragraph (paragraph)}
	<p>{paragraph}</p>
{/each}

{#if personalNote}
	<Card>
		<p class="note">{personalNote}</p>
	</Card>
{/if}

<p class="signature">{props.signature}</p>

<style>
	.lead {
		font-family: var(--font-display);
		font-size: var(--text-md);
		line-height: 1.35;
		color: var(--sage-900);
	}

	.note {
		margin: 0;
		color: var(--sage-900);
	}

	.signature {
		font-family: var(--font-display);
		font-size: var(--text-md);
		margin-top: var(--space-5);
	}
</style>
