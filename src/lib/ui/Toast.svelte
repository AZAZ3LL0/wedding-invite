<script lang="ts">
	interface Props {
		message: string;
		tone?: 'neutral' | 'ok' | 'warn';
		duration?: number;
		onDismiss?: () => void;
	}

	let { message, tone = 'neutral', duration = 4000, onDismiss }: Props = $props();

	$effect(() => {
		if (!message) return;
		const timer = setTimeout(() => onDismiss?.(), duration);
		return () => clearTimeout(timer);
	});
</script>

{#if message}
	<div class="toast {tone}" role="status" aria-live="polite">{message}</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 50%;
		bottom: var(--space-5);
		transform: translateX(-50%);
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		font-size: var(--text-sm);
		z-index: 10;
	}

	.neutral {
		background: var(--surface);
		color: var(--ink);
		border: var(--border);
	}

	.ok {
		background: var(--sage-900);
		color: var(--linen);
	}

	.warn {
		background: var(--warn);
		color: var(--linen);
	}
</style>
