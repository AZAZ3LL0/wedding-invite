<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Field from './Field.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'required'> {
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
		...rest
	}: Props = $props();
</script>

<Field {id} {label} {hint} {error} {required}>
	{#snippet children({ describedBy, invalid })}
		<input
			{id}
			bind:value
			{required}
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			class:invalid
			{...rest}
		/>
	{/snippet}
</Field>

<style>
	input {
		font: inherit;
		padding: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--ink);
		width: 100%;
	}

	input.invalid {
		border-color: var(--danger);
	}
</style>
