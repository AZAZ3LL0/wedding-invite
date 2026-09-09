<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'solid' | 'ghost' | 'link';
		size?: 'sm' | 'md';
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'solid',
		size = 'md',
		loading = false,
		disabled = false,
		type = 'button',
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="btn {variant} {size}"
	class:loading
	disabled={disabled || loading}
	aria-busy={loading}
	{...rest}
>
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--font-body);
		font-weight: 600;
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		cursor: pointer;
		transition: opacity 160ms var(--ease-out);
	}

	.md {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-base);
	}

	.sm {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
	}

	.solid {
		background: var(--sage-900);
		color: var(--linen);
	}

	.ghost {
		background: transparent;
		color: var(--sage-900);
		border-color: var(--clay);
	}

	.link {
		background: transparent;
		color: var(--sage-900);
		border: none;
		padding-inline: 0;
		text-decoration: underline;
	}

	.btn:hover:not(:disabled) {
		opacity: 0.86;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
