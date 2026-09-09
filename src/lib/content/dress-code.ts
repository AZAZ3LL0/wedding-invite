import type { SiteBlock } from './types';

const PALETTE = [
	{ hex: '#4A5C46', label: 'Хвоя' },
	{ hex: '#7C8F72', label: 'Шалфей' },
	{ hex: '#DCE3D5', label: 'Молодая зелень' },
	{ hex: '#B9A48C', label: 'Тёплый камень' },
	{ hex: '#F2EFE7', label: 'Лён' }
];

// Same palette, different pressure. Close people get a request, colleagues get a hint,
// per the segmentation example in tech.md section 8.
export const dressCodeBlocks: SiteBlock[] = [
	{
		id: 'dress-code-close',
		audience: ['family', 'friends'],
		component: 'dressCode',
		props: {
			title: 'Дресс-код',
			text: {
				ty: 'Держись зелёной и песочной гаммы. Ткани лёгкие: днём в саду жарко, вечером у воды прохладно, возьми что-то поверх.',
				vy: 'Держитесь зелёной и песочной гаммы. Ткани лёгкие: днём в саду жарко, вечером у воды прохладно, возьмите что-то поверх.'
			},
			colors: PALETTE,
			avoid: {
				ty: 'Белый оставь невесте. Каблук-шпилька на газоне не выживет, возьми устойчивую пару.',
				vy: 'Белый оставьте невесте. Каблук-шпилька на газоне не выживет, возьмите устойчивую пару.'
			}
		}
	},
	{
		id: 'dress-code-colleagues',
		audience: ['colleagues'],
		component: 'dressCode',
		props: {
			title: 'Что надеть',
			text: 'Строгого дресс-кода нет. Если хочется попасть в общую гамму, ориентируйтесь на зелёное и песочное.',
			colors: PALETTE,
			avoid: 'Церемония и фуршет проходят на траве, поэтому удобная обувь пригодится больше нарядной.'
		}
	}
];
