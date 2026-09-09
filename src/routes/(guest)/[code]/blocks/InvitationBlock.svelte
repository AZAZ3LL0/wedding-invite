<script lang="ts">
	import { Card } from '$lib/ui';
	import type { InvitationProps, Resolved } from '$lib/content';

	interface Props {
		props: Resolved<InvitationProps>;
		/** Who this link is addressed to. Comes from the invite, not from content. */
		greetingName: string;
		/** Paragraph written for this one link. Comes from the invite, not from content. */
		personalNote: string | null;
	}

	let { props, greetingName, personalNote }: Props = $props();
</script>

<!-- The content module sets the tone, the invite supplies the name. -->
<p class="eyebrow">{props.title}</p>
<h2>{greetingName}</h2>
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
	h2 {
		margin-top: var(--space-2);
	}

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
