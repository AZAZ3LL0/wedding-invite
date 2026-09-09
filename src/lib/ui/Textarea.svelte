<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import Field from './Field.svelte';

	interface Props extends Omit<HTMLTextareaAttributes, 'value' | 'required'> {
		id: string;
		label: string;
		value?: string;
		hint?: string;
		error?: string;
		required?: boolean;
	}

	let {
		id,
		label,
		value = $bindable(''),
		hint,
		error,
		required = false,
		rows = 4,
		...rest
	}: Props = $props();
</script>

<Field {id} {label} {hint} {error} {required}>
	{#snippet children({ describedBy, invalid })}
		<textarea
			{id}
			{rows}
			bind:value
			{required}
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			class:invalid
			{...rest}></textarea>
	{/snippet}
</Field>

<style>
	textarea {
		font: inherit;
		padding: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--ink);
		width: 100%;
		resize: vertical;
	}

	textarea.invalid {
		border-color: var(--danger);
	}
</style>
