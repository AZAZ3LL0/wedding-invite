import type { SiteBlock } from './types';

export const contactsBlocks: SiteBlock[] = [
	{
		id: 'contacts',
		audience: ['family', 'friends', 'colleagues'],
		component: 'contacts',
		props: {
			title: 'Кому написать',
			lead: {
				ty: 'Если что-то поменялось или ты не понимаешь, что делать со страницей, напиши нам. Отвечаем быстро.',
				vy: 'Если что-то поменялось или вы не понимаете, что делать со страницей, напишите нам. Отвечаем быстро.'
			},
			people: [
				{
					name: 'Алина',
					role: 'Всё про программу дня',
					phone: '+7 900 000-00-01',
					telegram: 'alina'
				},
				{
					name: 'Самат',
					role: 'Дорога, трансфер, ночёвка',
					phone: '+7 900 000-00-02',
					telegram: 'samat'
				},
				{ name: 'Ксения', role: 'Координатор на площадке', phone: '+7 900 000-00-03' }
			]
		}
	}
];
