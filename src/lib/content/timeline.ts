import type { SiteBlock } from './types';

const VENUE_MAP = 'https://yandex.ru/maps/?text=Московская область, Сосновый берег';

/**
 * The family day starts in the morning and includes the registry office. Everyone else
 * joins at the gathering, per the segmentation example in tech.md section 8. Two blocks,
 * not one block with a condition.
 */
export const timelineBlocks: SiteBlock[] = [
	{
		id: 'timeline-family',
		audience: ['family'],
		component: 'timeline',
		props: {
			title: 'Программа дня',
			intro: {
				ty: 'Начинаем рано. Если хочешь быть на сборах, приезжай к десяти.',
				vy: 'Начинаем рано. Если хотите быть на сборах, приезжайте к десяти.'
			},
			entries: [
				{
					time: '10:00',
					title: 'Утро невесты',
					note: 'Сборы в доме родителей, кофе и фотографии. Место для тех, кто хочет быть рядом с самого начала.'
				},
				{
					time: '12:30',
					title: 'ЗАГС',
					note: 'Регистрация в Дворце бракосочетания. Церемония занимает двадцать минут.',
					mapUrl: 'https://yandex.ru/maps/?text=Дворец бракосочетания'
				},
				{
					time: '14:00',
					title: 'Дорога на площадку',
					note: 'Автобус от ЗАГСа, места хватит всем.'
				},
				{ time: '15:00', title: 'Сбор гостей', note: 'Фуршет в саду.', mapUrl: VENUE_MAP },
				{
					time: '16:00',
					title: 'Выездная церемония',
					note: 'У воды. Если будет дождь, переносим под навес.'
				},
				{ time: '17:00', title: 'Ужин', note: 'Рассадка по карточкам у входа в зал.' },
				{ time: '20:00', title: 'Танцы', note: 'Живая группа до полуночи, дальше диджей.' },
				{ time: '23:00', title: 'Торт и фейерверк' }
			]
		}
	},
	{
		id: 'timeline-guests',
		audience: ['friends', 'colleagues'],
		component: 'timeline',
		props: {
			title: 'Программа дня',
			intro: 'Приезжайте к трём: церемония начинается ровно в четыре.',
			entries: [
				{
					time: '15:00',
					title: 'Сбор гостей',
					note: 'Фуршет в саду, тень и вода.',
					mapUrl: VENUE_MAP
				},
				{
					time: '16:00',
					title: 'Выездная церемония',
					note: 'У воды. Если будет дождь, переносим под навес.'
				},
				{ time: '17:00', title: 'Ужин', note: 'Рассадка по карточкам у входа в зал.' },
				{ time: '20:00', title: 'Танцы', note: 'Живая группа до полуночи, дальше диджей.' },
				{ time: '23:00', title: 'Торт и фейерверк' },
				{
					time: '00:30',
					title: 'Обратный трансфер',
					note: 'Автобус до города, отмечайтесь в анкете заранее.'
				}
			]
		}
	}
];
