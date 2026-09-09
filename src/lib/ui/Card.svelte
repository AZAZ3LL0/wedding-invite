<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		padded?: boolean;
		elevated?: boolean;
		children: Snippet;
	}

	let { padded = true, elevated = false, children }: Props = $props();
</script>

<div class="card" class:padded class:elevated>
	{@render children()}
</div>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--sage-100);
		border-radius: var(--radius-lg);
	}

	.padded {
		padding: var(--space-5);
	}

	.elevated {
		box-shadow: var(--shadow-soft);
		border-color: transparent;
	}
</style>
