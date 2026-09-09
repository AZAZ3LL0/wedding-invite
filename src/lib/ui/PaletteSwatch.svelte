<script lang="ts">
	import type { PaletteColor } from './types';

	interface Props {
		colors: PaletteColor[];
	}

	let { colors }: Props = $props();
</script>

<ul class="palette">
	{#each colors as color (color.hex)}
		<li>
			<span class="chip" style:background={color.hex}></span>
			<span class="label">{color.label}</span>
			<span class="hex tnum">{color.hex}</span>
		</li>
	{/each}
</ul>

<style>
	.palette {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 6rem;
	}

	.chip {
		display: block;
		height: 4rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--sage-100);
	}

	.label {
		font-size: var(--text-sm);
	}

	.hex {
		font-size: var(--text-xs);
		color: var(--sage-500);
		text-transform: uppercase;
	}
</style>
