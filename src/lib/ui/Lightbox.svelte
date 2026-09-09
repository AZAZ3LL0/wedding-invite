<script lang="ts">
	import type { GalleryImage } from './types';

	interface Props {
		images: GalleryImage[];
		index: number | null;
		onClose: () => void;
		onIndexChange: (index: number) => void;
	}

	let { images, index, onClose, onIndexChange }: Props = $props();

	let dialog: HTMLDialogElement | null = $state(null);

	$effect(() => {
		if (!dialog) return;
		if (index !== null && !dialog.open) dialog.showModal();
		if (index === null && dialog.open) dialog.close();
	});

	function step(delta: number) {
		if (index === null) return;
		onIndexChange((index + delta + images.length) % images.length);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') step(1);
		if (event.key === 'ArrowLeft') step(-1);
	}
</script>

<dialog
	bind:this={dialog}
	aria-label="Просмотр фотографии"
	onkeydown={onKeydown}
	oncancel={(event) => {
		event.preventDefault();
		onClose();
	}}
>
	{#if index !== null}
		{@const current = images[index]}
		<img src={current.src} alt={current.alt} width={current.width} height={current.height} />
		<div class="bar">
			<button type="button" onclick={() => step(-1)} aria-label="Предыдущая">←</button>
			<span class="tnum">{index + 1} / {images.length}</span>
			<button type="button" onclick={() => step(1)} aria-label="Следующая">→</button>
			<button type="button" onclick={onClose} aria-label="Закрыть">✕</button>
		</div>
		<!-- Neighbours are warmed so a swipe does not wait on the network. -->
		{#each [-1, 1] as delta (delta)}
			{@const neighbour = images[(index + delta + images.length) % images.length]}
			<link rel="preload" as="image" href={neighbour.src} />
		{/each}
	{/if}
</dialog>

<style>
	dialog {
		border: none;
		padding: 0;
		background: var(--ink);
		max-width: min(60rem, 100vw);
	}

	dialog::backdrop {
		background: rgba(35, 40, 31, 0.9);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding: var(--space-3);
		color: var(--linen);
		font-size: var(--text-sm);
	}

	button {
		background: none;
		border: none;
		color: var(--linen);
		font-size: var(--text-md);
		cursor: pointer;
	}
</style>
