<script lang="ts">
	import type { HeroProps, Resolved } from '$lib/content';
	import Picture from './Picture.svelte';

	let { props }: { props: Resolved<HeroProps> } = $props();
</script>

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
