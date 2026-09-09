<script lang="ts">
	import { PaletteSwatch } from '$lib/ui';
	import type { DressCodeProps, Resolved } from '$lib/content';

	let { props }: { props: Resolved<DressCodeProps> } = $props();
</script>

<h2>{props.title}</h2>
<p>{props.text}</p>

<PaletteSwatch colors={props.colors} />

{#if props.avoid}
	<p class="avoid">{props.avoid}</p>
{/if}

<style>
	.avoid {
		margin-top: var(--space-5);
		font-size: var(--text-sm);
		color: var(--sage-900);
	}
</style>
