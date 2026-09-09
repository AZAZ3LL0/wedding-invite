<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<ol class="timeline">
	{@render children()}
</ol>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0 0 0 var(--space-4);
		border-left: 1px solid var(--sage-100);
	}
</style>
