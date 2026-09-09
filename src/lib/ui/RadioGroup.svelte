<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		name: string;
		legend: string;
		options: Option[];
		value?: string | null;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
	}

	let {
		name,
		legend,
		options,
		value = $bindable(null),
		hint,
		error,
		required = false,
		disabled = false
	}: Props = $props();
</script>

<fieldset {disabled}>
	<legend>
		{legend}
		{#if required}<span aria-hidden="true" class="req">*</span>{/if}
	</legend>
	{#if hint}<p class="hint">{hint}</p>{/if}
	<div class="options">
		{#each options as option (option.value)}
			<label class="option" class:selected={value === option.value}>
				<input type="radio" {name} value={option.value} bind:group={value} />
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
	{#if error}<p class="error">{error}</p>{/if}
</fieldset>

<style>
	fieldset {
		border: none;
		margin: 0 0 var(--space-4);
		padding: 0;
	}

	legend {
		font-size: var(--text-sm);
		font-weight: 600;
		padding: 0;
		margin-bottom: var(--space-2);
	}

	.options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.option {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
		cursor: pointer;
	}

	.option.selected {
		background: var(--sage-100);
		border-color: var(--sage-900);
	}

	.hint {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
		color: var(--sage-500);
	}

	.error {
		margin: var(--space-2) 0 0;
		font-size: var(--text-sm);
		color: var(--danger);
	}

	.req {
		color: var(--danger);
	}
</style>
