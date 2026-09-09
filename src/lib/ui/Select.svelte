<script lang="ts">
	import Field from './Field.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		id: string;
		label: string;
		name?: string;
		options: Option[];
		value?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
	}

	let {
		id,
		label,
		name,
		options,
		value = $bindable(''),
		hint,
		error,
		required = false,
		disabled = false,
		placeholder = 'Выберите'
	}: Props = $props();
</script>

<Field {id} {label} {hint} {error} {required}>
	{#snippet children({ describedBy, invalid })}
		<select
			{id}
			{name}
			{required}
			{disabled}
			bind:value
			aria-describedby={describedBy}
			aria-invalid={invalid || undefined}
			class:invalid
		>
			<option value="" disabled>{placeholder}</option>
			{#each options as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	{/snippet}
</Field>

<style>
	select {
		font: inherit;
		padding: var(--space-3);
		border: var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		color: var(--ink);
		width: 100%;
	}

	select.invalid {
		border-color: var(--danger);
	}
</style>
