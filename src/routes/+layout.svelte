<script lang="ts">
	import type { Snippet } from 'svelte';
	import '$lib/styles/app.css';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@render children()}
