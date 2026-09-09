import type { SiteBlock } from './types';

// The story goes to the people who were there for it. Colleagues get the practical
// blocks instead.
export const loveStoryBlocks: SiteBlock[] = [
	{
		id: 'love-story',
		audience: ['family', 'friends'],
		component: 'loveStory',
		props: {
			title: 'Как это было',
			chapters: [
				{
					id: 'meeting',
					year: '2021',
					title: 'Очередь за кофе',
					text: 'Мы стояли в одной очереди и одновременно заказали один и тот же странный кофе. Разговор про него занял два часа.',
					image: 'story-meeting',
					imageAlt: 'Тёплый свет и зелень, кадр из первого лета вместе'
				},
				{
					id: 'trip',
					year: '2023',
					title: 'Первая долгая дорога',
					text: 'Тысяча километров на машине, сломанный кондиционер и решение, что дальше едем только вместе.'
				},
				{
					id: 'proposal',
					year: '2026',
					title: 'Предложение',
					text: 'Без съёмочной группы и воздушных шаров. Обычный вечер на кухне, вопрос и очень быстрый ответ.',
					image: 'story-proposal',
					imageAlt: 'Вечерний сад в зелёных тонах'
				}
			]
		}
	}
];
