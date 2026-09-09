<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, Reveal, SeatMeter, Toast } from '$lib/ui';
	import type { GuestView } from '$lib/types';
	import BlockRenderer from './blocks/BlockRenderer.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const invite = $derived(data.invite);
	const blocks = $derived(data.blocks);
	const taken = $derived(invite.seats - invite.freeSeats);

	let pendingGuestId: string | null = $state(null);
	let toast = $state('');

	$effect(() => {
		if (form && 'message' in form && form.message) toast = form.message;
	});

	function guestName(guest: GuestView): string {
		return [guest.firstName, guest.lastName].filter(Boolean).join(' ') || 'Имя уточняется';
	}

	function statusLabel(guest: GuestView): string {
		if (guest.rsvp === 'accepted') return 'Идёт';
		if (guest.rsvp === 'declined') return 'Не идёт';
		return 'Ждём ответ';
	}
</script>

<svelte:head>
	<title>Приглашение для {invite.greetingName}</title>
</svelte:head>

<main>
	{#each blocks as block (block.id)}
		<BlockRenderer {block} greetingName={invite.greetingName} personalNote={invite.personalNote} />
	{/each}

	<section id="rsvp" class="block">
		<Reveal>
			<Card>
				<h2>Кто придёт</h2>
				<SeatMeter seats={invite.seats} {taken} />

				{#if invite.rsvpLocked}
					<p class="locked">Список гостей закрыт. Если планы изменились, напишите организаторам.</p>
				{/if}

				<ul class="guests">
					{#each invite.guests as guest (guest.id)}
						<li>
							<div class="row">
								<span class="name">{guestName(guest)}</span>
								<Badge
									tone={guest.rsvp === 'accepted'
										? 'ok'
										: guest.rsvp === 'declined'
											? 'muted'
											: 'warn'}
								>
									{statusLabel(guest)}
								</Badge>
							</div>
							<form
								method="POST"
								action="?/setRsvp"
								use:enhance={() => {
									pendingGuestId = guest.id;
									return async ({ update }) => {
										await update({ reset: false });
										pendingGuestId = null;
									};
								}}
							>
								<input type="hidden" name="guestId" value={guest.id} />
								<div class="actions">
									<Button
										size="sm"
										variant={guest.rsvp === 'accepted' ? 'solid' : 'ghost'}
										type="submit"
										name="status"
										value="accepted"
										loading={pendingGuestId === guest.id}
										disabled={invite.rsvpLocked}
									>
										Подтвердить
									</Button>
									<Button
										size="sm"
										variant={guest.rsvp === 'declined' ? 'solid' : 'ghost'}
										type="submit"
										name="status"
										value="declined"
										loading={pendingGuestId === guest.id}
										disabled={invite.rsvpLocked}
									>
										Не смогу
									</Button>
								</div>
							</form>
						</li>
					{/each}
				</ul>
			</Card>
		</Reveal>
	</section>
</main>

<Toast message={toast} tone="ok" onDismiss={() => (toast = '')} />

<style>
	main {
		padding-bottom: var(--space-8);
	}

	.block {
		max-width: 40rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4);
		border-top: 1px solid var(--sage-100);
	}

	.locked {
		font-size: var(--text-sm);
		color: var(--warn);
	}

	.guests {
		list-style: none;
		margin: var(--space-5) 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.name {
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
