<script lang="ts">
	import type { GuestView, RsvpStatus } from '$lib/types';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';

	interface Props {
		guest: GuestView;
		onChange?: (status: RsvpStatus) => void;
		disabled?: boolean;
		pending?: boolean;
	}

	let { guest, onChange, disabled = false, pending = false }: Props = $props();

	const name = $derived(
		[guest.firstName, guest.lastName].filter(Boolean).join(' ') || 'Имя уточняется'
	);

	const tone = $derived(
		guest.rsvp === 'accepted' ? 'ok' : guest.rsvp === 'declined' ? 'muted' : 'warn'
	);

	const statusLabel = $derived(
		guest.rsvp === 'accepted' ? 'Идёт' : guest.rsvp === 'declined' ? 'Не идёт' : 'Ждём ответ'
	);
</script>

<article class="guest">
	<div class="head">
		<h3>{name}</h3>
		<Badge {tone}>{statusLabel}</Badge>
	</div>
	{#if guest.origin === 'companion'}
		<p class="note">Спутник</p>
	{/if}
	{#if onChange}
		<div class="actions">
			<Button
				size="sm"
				variant={guest.rsvp === 'accepted' ? 'solid' : 'ghost'}
				loading={pending}
				{disabled}
				onclick={() => onChange('accepted')}
			>
				Подтвердить
			</Button>
			<Button
				size="sm"
				variant={guest.rsvp === 'declined' ? 'solid' : 'ghost'}
				loading={pending}
				{disabled}
				onclick={() => onChange('declined')}
			>
				Не смогу
			</Button>
		</div>
	{/if}
</article>

<style>
	.guest {
		border: 1px solid var(--sage-100);
		border-radius: var(--radius-md);
		background: var(--surface);
		padding: var(--space-4);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	h3 {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
	}

	.note {
		margin: var(--space-1) 0 0;
		font-size: var(--text-sm);
		color: var(--sage-500);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}
</style>
