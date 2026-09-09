<script lang="ts">
	interface Props {
		time: string;
		title: string;
		note?: string;
		mapUrl?: string;
	}

	let { time, title, note, mapUrl }: Props = $props();
</script>

<li class="item">
	<span class="time tnum">{time}</span>
	<div class="body">
		<h3>{title}</h3>
		{#if note}<p>{note}</p>{/if}
		{#if mapUrl}<a href={mapUrl} rel="noreferrer noopener" target="_blank">Как добраться</a>{/if}
	</div>
</li>

<style>
	.item {
		display: grid;
		grid-template-columns: 4.5rem 1fr;
		gap: var(--space-4);
		padding: var(--space-4) 0;
	}

	.time {
		font-family: var(--font-utility);
		font-size: var(--text-sm);
		color: var(--sage-500);
		padding-top: 2px;
	}

	h3 {
		margin: 0 0 var(--space-1);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
	}

	p {
		margin: 0;
		color: var(--sage-900);
		font-size: var(--text-sm);
	}
</style>
