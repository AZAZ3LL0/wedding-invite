<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from './reduced-motion';

	interface Props {
		/** Stagger offset in milliseconds. */
		delay?: number;
		once?: boolean;
		children: Snippet;
	}

	let { delay = 0, once = true, children }: Props = $props();

	let element: HTMLDivElement | null = $state(null);
	// Reduced motion means the content is simply there: no fade, no wait.
	let shown = $state(false);

	$effect(() => {
		if (!element) return;
		if (prefersReducedMotion()) {
			shown = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) {
						if (!once) shown = false;
						continue;
					}
					shown = true;
					if (once) observer.unobserve(entry.target);
				}
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div bind:this={element} class="reveal" class:shown style:--reveal-delay={`${delay}ms`}>
	{@render children()}
</div>

<style>
	.reveal {
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity var(--duration-reveal) var(--ease-out) var(--reveal-delay),
			transform var(--duration-reveal) var(--ease-out) var(--reveal-delay);
	}

	.reveal.shown {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
