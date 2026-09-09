<script lang="ts">
	import { MapEmbed } from '$lib/ui';
	import { images } from '$lib/content/generated/images';
	import type { Resolved, VenueProps } from '$lib/content';

	let { props }: { props: Resolved<VenueProps> } = $props();

	// MapEmbed takes a single static image on purpose: no third party map script runs
	// on the guest page.
	const map = $derived(images[props.mapImage]);
</script>

<h2>{props.title}</h2>
<p class="name">{props.name}</p>

<MapEmbed
	src={map.fallback}
	alt={props.mapAlt}
	width={map.width}
	height={map.height}
	href={props.mapUrl}
	address={props.address}
/>

{#each props.notes as note (note)}
	<p class="note">{note}</p>
{/each}

<style>
	.name {
		font-family: var(--font-display);
		font-size: var(--text-md);
		margin-bottom: var(--space-4);
	}

	.note {
		margin-top: var(--space-4);
		font-size: var(--text-sm);
		color: var(--sage-900);
	}
</style>
