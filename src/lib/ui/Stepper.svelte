<script lang="ts">
	interface Props {
		steps: string[];
		/** Zero based index of the step the guest is on. */
		current: number;
	}

	let { steps, current }: Props = $props();
</script>

<ol class="stepper" aria-label="Шаги подтверждения">
	{#each steps as step, index (step)}
		<li
			class="step"
			class:done={index < current}
			class:active={index === current}
			aria-current={index === current ? 'step' : undefined}
		>
			<span class="dot tnum" aria-hidden="true">{index + 1}</span>
			<span class="label">{step}</span>
		</li>
	{/each}
</ol>

<style>
	.stepper {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		list-style: none;
		margin: 0 0 var(--space-5);
		padding: 0;
	}

	.step {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--sage-500);
	}

	.dot {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		border: 1px solid var(--clay);
		font-size: var(--text-xs);
	}

	.active {
		color: var(--ink);
		font-weight: 600;
	}

	.active .dot {
		background: var(--sage-900);
		border-color: var(--sage-900);
		color: var(--linen);
	}

	.done .dot {
		background: var(--sage-100);
		border-color: var(--sage-500);
		color: var(--sage-900);
	}
</style>
