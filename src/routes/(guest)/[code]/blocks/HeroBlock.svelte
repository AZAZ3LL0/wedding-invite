<script lang="ts">
	import { images } from '$lib/content/generated/images';
	import type { HeroProps, Resolved } from '$lib/content';
	import Picture from './Picture.svelte';

	let { props }: { props: Resolved<HeroProps> } = $props();

	const asset = $derived(images[props.image]);
</script>

<!-- The LCP image is the only thing worth preloading: the preload scanner finds it in
     the head, before it has parsed its way down to the markup. Fonts are not preloaded
     on purpose, they swap in and would only take bandwidth from this request. -->
<svelte:head>
	<link
		rel="preload"
		as="image"
		type="image/avif"
		imagesrcset={asset.avif}
		imagesizes="100vw"
		fetchpriority="high"
	/>
</svelte:head>

<!-- The hero image is the LCP element: eager, high priority, no entrance animation. -->
<section class="hero">
	<div class="frame">
		<Picture name={props.image} alt={props.imageAlt} priority sizes="100vw" />
	</div>
	<div class="text">
		<p class="eyebrow">{props.eyebrow}</p>
		<h1>{props.names}</h1>
		<p class="date tnum"><time datetime={props.dateTime}>{props.date}</time></p>
		<p class="place">{props.place}</p>
	</div>
</section>

<style>
	.hero {
		position: relative;
		margin-bottom: var(--space-7);
	}

	.frame {
		aspect-ratio: 3 / 4;
		overflow: hidden;
	}

	.frame :global(img) {
		height: 100%;
		object-fit: cover;
	}

	.text {
		padding: var(--space-6) var(--space-4) 0;
		text-align: center;
	}

	h1 {
		font-size: var(--text-3xl);
		margin: var(--space-2) 0 var(--space-4);
	}

	.date {
		font-family: var(--font-utility);
		font-size: var(--text-sm);
		margin-bottom: var(--space-2);
	}

	.place,
	.date {
		color: var(--sage-900);
		max-width: none;
	}

	.place {
		font-size: var(--text-sm);
	}

	@media (min-width: 48rem) {
		.frame {
			aspect-ratio: 16 / 9;
		}

		.text {
			padding-top: var(--space-7);
		}
	}
</style>
