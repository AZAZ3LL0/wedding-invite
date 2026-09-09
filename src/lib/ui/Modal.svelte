<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, title, onClose, children, footer }: Props = $props();

	let dialog: HTMLDialogElement | null = $state(null);

	// The native dialog gives focus trap, Esc and the top layer for free. Keeping the
	// open prop in charge means the caller stays the single source of truth.
	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function onCancel(event: Event) {
		event.preventDefault();
		onClose();
	}
</script>

<dialog bind:this={dialog} aria-label={title} oncancel={onCancel} onclose={() => open && onClose()}>
	<div class="body">
		<h2>{title}</h2>
		{@render children()}
		{#if footer}
			<div class="footer">{@render footer()}</div>
		{/if}
	</div>
</dialog>

<style>
	dialog {
		border: none;
		border-radius: var(--radius-lg);
		padding: 0;
		background: var(--surface);
		color: var(--ink);
		max-width: min(32rem, calc(100vw - 2rem));
		box-shadow: var(--shadow-soft);
	}

	dialog::backdrop {
		background: rgba(35, 40, 31, 0.44);
	}

	.body {
		padding: var(--space-5);
	}

	h2 {
		margin-top: 0;
	}

	.footer {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		margin-top: var(--space-5);
	}
</style>
