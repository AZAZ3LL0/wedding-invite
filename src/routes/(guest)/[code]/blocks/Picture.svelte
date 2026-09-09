<script lang="ts">
	import { images, type ImageName } from '$lib/content/generated/images';

	interface Props {
		name: ImageName;
		alt: string;
		/** Layout hint for the browser, so it picks the smallest usable width. */
		sizes?: string;
		/** True for the LCP image only: eager, high priority, never animated in. */
		priority?: boolean;
	}

	let { name, alt, sizes = '100vw', priority = false }: Props = $props();

	const asset = $derived(images[name]);
</script>

<picture>
	<source type="image/avif" srcset={asset.avif} {sizes} />
	<source type="image/webp" srcset={asset.webp} {sizes} />
	<!-- Intrinsic width and height keep the box reserved before the bytes arrive. -->
	<img
		src={asset.fallback}
		srcset={asset.jpeg}
		{sizes}
		{alt}
		width={asset.width}
		height={asset.height}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding={priority ? 'sync' : 'async'}
	/>
</picture>

<style>
	picture {
		display: block;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
