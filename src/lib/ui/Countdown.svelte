<script lang="ts">
	interface Props {
		/** Target moment, already resolved on the server. */
		target: string;
		/** Server rendered "now", so the first paint matches the server output. */
		now?: string;
	}

	let { target, now }: Props = $props();

	const targetMs = $derived(new Date(target).getTime());
	// Null until the first tick, so the first paint uses the server clock and matches
	// the server rendered markup.
	let clock: number | null = $state(null);
	const current = $derived(clock ?? (now ? new Date(now).getTime() : Date.now()));

	// A wedding countdown does not need seconds, and a per-second timer keeps the
	// main thread busy for nothing.
	$effect(() => {
		const timer = setInterval(() => (clock = Date.now()), 60_000);
		return () => clearInterval(timer);
	});

	const left = $derived(Math.max(0, targetMs - current));
	const days = $derived(Math.floor(left / 86_400_000));
	const hours = $derived(Math.floor((left % 86_400_000) / 3_600_000));
	const minutes = $derived(Math.floor((left % 3_600_000) / 60_000));
</script>

<div class="countdown tnum" role="timer">
	<span><b>{days}</b> дн</span>
	<span><b>{hours}</b> ч</span>
	<span><b>{minutes}</b> мин</span>
</div>

<style>
	.countdown {
		display: flex;
		gap: var(--space-5);
		font-family: var(--font-utility);
		font-size: var(--text-sm);
		color: var(--sage-900);
	}

	b {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 300;
		line-height: 1;
		color: var(--ink);
	}
</style>
