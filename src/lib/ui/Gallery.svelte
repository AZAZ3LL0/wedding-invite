<script lang="ts">
	import type { GalleryImage } from './types';
	import Lightbox from './Lightbox.svelte';

	interface Props {
		images: GalleryImage[];
		label?: string;
	}

	let { images, label = 'Фотографии' }: Props = $props();

	let openIndex: number | null = $state(null);
</script>

<section aria-label={label}>
	<ul class="grid">
		{#each images as image, index (image.src)}
			<li>
				<button type="button" onclick={() => (openIndex = index)}>
					<img
						src={image.src}
						alt={image.alt}
						width={image.width}
						height={image.height}
						loading="lazy"
						decoding="async"
					/>
				</button>
			</li>
		{/each}
	</ul>
</section>

<Lightbox
	{images}
	index={openIndex}
	onClose={() => (openIndex = null)}
	onIndexChange={(index) => (openIndex = index)}
/>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: var(--space-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	button {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-md);
	}
</style>
