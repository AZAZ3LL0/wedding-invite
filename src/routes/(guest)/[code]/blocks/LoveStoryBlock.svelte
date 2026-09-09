<script lang="ts">
	import { Reveal } from '$lib/ui';
	import type { LoveStoryProps, Resolved } from '$lib/content';
	import Picture from './Picture.svelte';

	let { props }: { props: Resolved<LoveStoryProps> } = $props();
</script>

<h2>{props.title}</h2>

<ol class="chapters">
	{#each props.chapters as chapter, index (chapter.id)}
		<li>
			<Reveal delay={index * 80}>
				<p class="year tnum">{chapter.year}</p>
				<h3>{chapter.title}</h3>
				<p>{chapter.text}</p>
				{#if chapter.image && chapter.imageAlt}
					<div class="shot">
						<Picture
							name={chapter.image}
							alt={chapter.imageAlt}
							sizes="(min-width: 48rem) 40rem, 100vw"
						/>
					</div>
				{/if}
			</Reveal>
		</li>
	{/each}
</ol>

<style>
	.chapters {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.year {
		font-family: var(--font-utility);
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		color: var(--sage-500);
		margin-bottom: var(--space-1);
	}

	h3 {
		margin-bottom: var(--space-2);
	}

	.shot {
		margin-top: var(--space-4);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
</style>
