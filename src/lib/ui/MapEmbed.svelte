<script lang="ts">
	interface Props {
		/** Pre-rendered static map image. No third party script runs on the guest page. */
		src: string;
		alt: string;
		width?: number;
		height?: number;
		href: string;
		address: string;
	}

	let { src, alt, width = 960, height = 540, href, address }: Props = $props();
</script>

<figure class="map">
	<img {src} {alt} {width} {height} loading="lazy" decoding="async" />
	<figcaption>
		<span>{address}</span>
		<a {href} rel="noreferrer noopener" target="_blank">Открыть карту</a>
	</figcaption>
</figure>

<style>
	.map {
		margin: 0;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-md);
		border: 1px solid var(--sage-100);
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-2);
		margin-top: var(--space-2);
		font-size: var(--text-sm);
		color: var(--sage-900);
	}
</style>
