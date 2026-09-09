<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		label: string;
		hint?: string;
		error?: string;
		required?: boolean;
		children: Snippet<[{ describedBy: string | undefined; invalid: boolean }]>;
	}

	let { id, label, hint, error, required = false, children }: Props = $props();

	const hintId = $derived(hint ? `${id}-hint` : undefined);
	const errorId = $derived(error ? `${id}-error` : undefined);
	const describedBy = $derived([errorId, hintId].filter(Boolean).join(' ') || undefined);
</script>

<div class="field">
	<label for={id}>
		{label}
		{#if required}<span aria-hidden="true" class="req">*</span>{/if}
	</label>
	{@render children({ describedBy, invalid: Boolean(error) })}
	{#if hint}<p class="hint" id={hintId}>{hint}</p>{/if}
	{#if error}<p class="error" id={errorId}>{error}</p>{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.req {
		color: var(--danger);
	}

	.hint,
	.error {
		margin: 0;
		font-size: var(--text-sm);
	}

	.hint {
		color: var(--sage-500);
	}

	.error {
		color: var(--danger);
	}
</style>
