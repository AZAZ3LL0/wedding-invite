<script lang="ts">
	import {
		Accordion,
		AdminTable,
		Badge,
		Button,
		Card,
		CheckboxGroup,
		Countdown,
		Gallery,
		GuestCard,
		Input,
		MapEmbed,
		Modal,
		PaletteSwatch,
		RadioGroup,
		Reveal,
		SeatMeter,
		Select,
		Stepper,
		Textarea,
		Timeline,
		TimelineItem,
		Toast
	} from '$lib/ui';
	import type { GuestView } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let text = $state('Пётр');
	let longText = $state('');
	let meal = $state<string | null>('meat');
	let drinks = $state<string[]>(['soft']);
	let transfer = $state('yes');
	let modalOpen = $state(false);
	let toast = $state('');

	const guest: GuestView = {
		id: '00000000-0000-4000-8000-000000000001',
		firstName: 'Дмитрий',
		lastName: 'Кузнецов',
		origin: 'preset',
		ageGroup: 'adult',
		rsvp: 'accepted',
		isPrimary: true,
		addedByGuestId: null,
		answers: {}
	};

	const companion: GuestView = {
		...guest,
		id: '00000000-0000-4000-8000-000000000002',
		firstName: 'Мария',
		lastName: null,
		origin: 'companion',
		isPrimary: false,
		rsvp: 'pending'
	};

	const rows = [
		{ code: 'FAM4SEAT01', greeting: 'Семья Ивановых', seats: 4, answered: 2 },
		{ code: 'FRNDNAMED2', greeting: 'Дмитрий', seats: 2, answered: 1 },
		{ code: 'PARTYBBB99', greeting: 'Наталья', seats: 1, answered: 0 }
	];
</script>

<svelte:head>
	<title>Kitchen sink</title>
</svelte:head>

<main>
	<h1>Kitchen sink</h1>
	<p>Каждый примитив из tech.md, раздел 11, отрисован здесь до того, как попадёт в фичу.</p>

	<section>
		<h2>Button</h2>
		<div class="row">
			<Button>Подтвердить</Button>
			<Button variant="ghost">Не смогу</Button>
			<Button variant="link">Изменить ответ</Button>
			<Button size="sm">Мелкая</Button>
			<Button loading>Сохраняем</Button>
			<Button disabled>Недоступно</Button>
		</div>
	</section>

	<section>
		<h2>Input, Textarea, Select</h2>
		<Input id="ks-name" label="Имя" bind:value={text} hint="Как обращаться к гостю" required />
		<Input id="ks-error" label="Фамилия" value="" error="Укажите фамилию спутника" />
		<Textarea id="ks-note" label="Комментарий" bind:value={longText} hint="Необязательно" />
		<Select
			id="ks-select"
			label="Приглашение"
			options={rows.map((row) => ({ value: row.code, label: row.greeting }))}
			value=""
		/>
	</section>

	<section>
		<h2>RadioGroup, CheckboxGroup</h2>
		<RadioGroup
			name="ks-meal"
			legend="Горячее"
			bind:value={meal}
			required
			options={[
				{ value: 'meat', label: 'Мясо' },
				{ value: 'fish', label: 'Рыба' },
				{ value: 'veg', label: 'Вегетарианское' }
			]}
		/>
		<CheckboxGroup
			name="ks-drinks"
			legend="Напитки на фуршете"
			bind:value={drinks}
			options={[
				{ value: 'wine_red', label: 'Красное вино' },
				{ value: 'wine_white', label: 'Белое вино' },
				{ value: 'soft', label: 'Безалкогольное' }
			]}
		/>
		<RadioGroup
			name="ks-transfer"
			legend="Трансфер"
			bind:value={transfer}
			options={[
				{ value: 'yes', label: 'Да' },
				{ value: 'no', label: 'Доберусь сам' }
			]}
		/>
	</section>

	<section>
		<h2>Card, Badge</h2>
		<Card>
			<div class="row">
				<Badge>Ждём ответ</Badge>
				<Badge tone="ok">Идёт</Badge>
				<Badge tone="warn">Запрос мест</Badge>
				<Badge tone="muted">Не идёт</Badge>
			</div>
		</Card>
	</section>

	<section>
		<h2>SeatMeter, GuestCard</h2>
		<SeatMeter seats={4} taken={2} />
		<div class="grid">
			<GuestCard {guest} onChange={(status) => (toast = `Ответ: ${status}`)} />
			<GuestCard guest={companion} onChange={(status) => (toast = `Ответ: ${status}`)} pending />
		</div>
	</section>

	<section>
		<h2>Stepper</h2>
		<Stepper steps={['Статус', 'Спутники', 'Анкета']} current={1} />
	</section>

	<section>
		<h2>Modal, Toast</h2>
		<div class="row">
			<Button onclick={() => (modalOpen = true)}>Открыть окно</Button>
			<Button variant="ghost" onclick={() => (toast = 'Подтверждено')}>Показать тост</Button>
		</div>
		<Modal open={modalOpen} title="Убрать спутника" onClose={() => (modalOpen = false)}>
			<p>Мария потеряет место. Ответ можно вернуть до закрытия списка.</p>
			{#snippet footer()}
				<Button variant="ghost" onclick={() => (modalOpen = false)}>Отмена</Button>
				<Button onclick={() => (modalOpen = false)}>Убрать</Button>
			{/snippet}
		</Modal>
	</section>

	<section>
		<h2>Accordion</h2>
		<Accordion
			items={[
				{ id: 'gift', question: 'Что подарить', answer: 'Ничего не нужно, приезжайте сами.' },
				{ id: 'kids', question: 'Можно с детьми', answer: 'Да, для детей будет отдельный стол.' },
				{ id: 'park', question: 'Где припарковаться', answer: 'Парковка у входа, мест хватает.' }
			]}
		/>
	</section>

	<section>
		<h2>Timeline</h2>
		<Timeline>
			<TimelineItem time="14:00" title="Сбор гостей" note="Приветственный фуршет во дворе" />
			<TimelineItem time="15:00" title="Церемония" mapUrl="https://yandex.ru/maps" />
			<TimelineItem time="17:00" title="Ужин" note="Рассадка по карточкам" />
		</Timeline>
	</section>

	<section>
		<h2>Countdown</h2>
		<Countdown target={data.weddingDate} now={data.now} />
	</section>

	<section>
		<h2>PaletteSwatch</h2>
		<PaletteSwatch
			colors={[
				{ hex: '#4A5C46', label: 'Шалфей' },
				{ hex: '#DCE3D5', label: 'Светлая зелень' },
				{ hex: '#B9A48C', label: 'Глина' },
				{ hex: '#F2EFE7', label: 'Лён' }
			]}
		/>
	</section>

	<section>
		<h2>Gallery, Lightbox</h2>
		<Gallery images={data.images} />
	</section>

	<section>
		<h2>MapEmbed</h2>
		<MapEmbed
			src={data.mapImage}
			alt="Схема проезда к площадке"
			href="https://yandex.ru/maps"
			address="Московская область, усадьба Заречье"
		/>
	</section>

	<section>
		<h2>AdminTable</h2>
		<AdminTable
			caption="Приглашения"
			{rows}
			rowKey={(row) => row.code}
			columns={[
				{ key: 'code', title: 'Код', sortable: true },
				{ key: 'greeting', title: 'Обращение', sortable: true },
				{ key: 'seats', title: 'Мест', align: 'end', sortable: true },
				{ key: 'answered', title: 'Ответили', align: 'end', sortable: true }
			]}
		/>
		<h3>Пустое состояние</h3>
		<AdminTable
			caption="Приглашения без ответов"
			rows={[]}
			rowKey={(row: { code: string }) => row.code}
			columns={[{ key: 'code', title: 'Код' }]}
		/>
	</section>

	<section>
		<h2>Reveal</h2>
		<Reveal delay={0}>
			<Card><p>Первый блок появляется без задержки.</p></Card>
		</Reveal>
		<Reveal delay={80}>
			<Card><p>Второй со сдвигом 80 мс.</p></Card>
		</Reveal>
	</section>
</main>

<Toast message={toast} onDismiss={() => (toast = '')} />

<style>
	main {
		max-width: 52rem;
		margin: 0 auto;
		padding: var(--space-7) var(--space-4) var(--space-8);
	}

	section {
		margin-bottom: var(--space-7);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--space-3);
		margin-top: var(--space-4);
	}
</style>
