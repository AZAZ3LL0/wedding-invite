<script lang="ts">
	import { Accordion } from '$lib/ui';
	import type { FaqProps, Resolved } from '$lib/content';

	let { props }: { props: Resolved<FaqProps> } = $props();
</script>

<h2>{props.title}</h2>
<Accordion items={props.items} />
