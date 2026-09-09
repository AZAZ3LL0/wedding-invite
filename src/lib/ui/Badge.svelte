<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'neutral' | 'ok' | 'warn' | 'muted';
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();
</script>

<span class="badge {tone}">{@render children()}</span>

<style>
	.badge {
		display: inline-block;
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.02em;
		border: 1px solid transparent;
	}

	.neutral {
		background: var(--sage-100);
		color: var(--sage-900);
	}

	.ok {
		background: var(--sage-900);
		color: var(--linen);
	}

	.warn {
		background: transparent;
		border-color: var(--warn);
		color: var(--warn);
	}

	.muted {
		background: transparent;
		border-color: var(--clay);
		color: var(--clay);
	}
</style>
