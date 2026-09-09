<script lang="ts">
	interface Props {
		seats: number;
		taken: number;
	}

	let { seats, taken }: Props = $props();

	const filled = $derived(Math.min(taken, seats));
	const free = $derived(Math.max(0, seats - taken));
</script>

<div class="meter">
	<div class="pips" role="img" aria-label={`Занято ${filled} из ${seats} мест`}>
		{#each Array.from({ length: seats }, (_, index) => index) as index (index)}
			<span class="pip" class:filled={index < filled}></span>
		{/each}
	</div>
	<p class="caption tnum">
		{#if free > 0}
			Свободно {free} из {seats}
		{:else}
			Все {seats} мест заняты
		{/if}
	</p>
</div>

<style>
	.meter {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.pips {
		display: flex;
		gap: var(--space-1);
	}

	.pip {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		border: 1px solid var(--sage-500);
	}

	.pip.filled {
		background: var(--sage-900);
		border-color: var(--sage-900);
	}

	.caption {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--sage-900);
	}
</style>
