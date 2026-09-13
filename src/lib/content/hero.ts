import type { SiteBlock } from './types';

// One hero for everyone: the first screen says who, when and where, and nothing that
// depends on the category.
export const heroBlocks: SiteBlock[] = [
	{
		id: 'hero',
		audience: ['family', 'friends', 'colleagues'],
		component: 'hero',
		props: {
			eyebrow: 'Мы женимся',
			names: 'Самат и Алина',
			date: '12 июня 2027, суббота',
			dateTime: '2027-06-12T15:00:00+03:00',
			place: 'Загородный клуб «Сосновый берег», Московская область',
			image: 'hero',
			imageAlt: 'Зелёные стебли и мягкий свет летнего сада'
		}
	}
];
