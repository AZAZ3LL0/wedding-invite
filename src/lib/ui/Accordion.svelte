<script lang="ts">
	interface Item {
		id: string;
		question: string;
		answer: string;
	}

	interface Props {
		items: Item[];
		/** Index of the item open on load. FAQ opens its first entry. */
		defaultOpen?: number;
	}

	let { items, defaultOpen = 0 }: Props = $props();

	// Until the reader touches the accordion, the open item follows the props.
	let toggled = $state<{ id: string | null } | null>(null);
	const openId = $derived(toggled ? toggled.id : (items[defaultOpen]?.id ?? null));
</script>

<div class="accordion">
	{#each items as item (item.id)}
		{@const expanded = openId === item.id}
		<div class="item">
			<h3>
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={`panel-${item.id}`}
					onclick={() => (toggled = { id: expanded ? null : item.id })}
				>
					<span>{item.question}</span>
					<span class="mark" aria-hidden="true">{expanded ? '−' : '+'}</span>
				</button>
			</h3>
			{#if expanded}
				<div class="panel" id={`panel-${item.id}`}>
					<p>{item.answer}</p>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.item {
		border-bottom: 1px solid var(--sage-100);
	}

	h3 {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-base);
	}

	button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
		padding: var(--space-4) 0;
		background: none;
		border: none;
		font: inherit;
		font-weight: 600;
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}

	.mark {
		color: var(--sage-500);
		font-size: var(--text-md);
	}

	.panel p {
		margin: 0 0 var(--space-4);
		color: var(--sage-900);
	}
</style>
