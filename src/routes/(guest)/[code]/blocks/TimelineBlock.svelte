<script lang="ts">
	import { Timeline, TimelineItem } from '$lib/ui';
	import type { Resolved, TimelineProps } from '$lib/content';

	let { props }: { props: Resolved<TimelineProps> } = $props();
</script>

<h2>{props.title}</h2>
{#if props.intro}<p>{props.intro}</p>{/if}

<Timeline>
	{#each props.entries as entry (entry.time + entry.title)}
		<TimelineItem time={entry.time} title={entry.title} note={entry.note} mapUrl={entry.mapUrl} />
	{/each}
</Timeline>
