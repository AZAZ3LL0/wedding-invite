<script lang="ts">
	import type { ContactsProps, Resolved } from '$lib/content';

	let { props }: { props: Resolved<ContactsProps> } = $props();

	function telHref(phone: string): string {
		return `tel:${phone.replace(/[^+\d]/g, '')}`;
	}
</script>

<h2>{props.title}</h2>
<p>{props.lead}</p>

<ul class="people">
	{#each props.people as person (person.phone)}
		<li>
			<p class="name">{person.name}</p>
			<p class="role">{person.role}</p>
			<a class="tnum" href={telHref(person.phone)}>{person.phone}</a>
			{#if person.telegram}
				<a href={`https://t.me/${person.telegram}`} rel="noreferrer noopener" target="_blank">
					Telegram
				</a>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.people {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-5);
	}

	.name {
		margin: 0;
		font-weight: 600;
	}

	.role {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
		color: var(--sage-500);
	}

	a + a {
		margin-left: var(--space-4);
	}

	@media (min-width: 36rem) {
		.people {
			grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		}
	}
</style>
