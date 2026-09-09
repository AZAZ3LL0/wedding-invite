import { describe, expect, it } from 'vitest';
import { resolveCopy, t } from '$lib/content/copy';
import { resolveBlocks } from '$lib/content';

/**
 * Acceptance: the address form is picked once, on the server, and the form the guest
 * did not get never leaves the server.
 */

describe('address form', () => {
	it('picks the requested form of a pair', () => {
		const copy = { ty: 'Приходи', vy: 'Приходите' };
		expect(t(copy, 'ty')).toBe('Приходи');
		expect(t(copy, 'vy')).toBe('Приходите');
	});

	it('leaves neutral text alone', () => {
		expect(t('Ответьте до 1 мая', 'ty')).toBe('Ответьте до 1 мая');
	});

	it('reaches pairs nested in arrays and objects', () => {
		const props = {
			title: { ty: 'Программа', vy: 'Программа дня' },
			entries: [{ time: '15:00', note: { ty: 'Приезжай', vy: 'Приезжайте' } }],
			nested: { deep: { ty: 'да', vy: 'да, конечно' } }
		};

		expect(resolveCopy(props, 'ty')).toEqual({
			title: 'Программа',
			entries: [{ time: '15:00', note: 'Приезжай' }],
			nested: { deep: 'да' }
		});
	});

	it('keeps null and undefined as they are', () => {
		expect(resolveCopy({ a: null, b: undefined }, 'vy')).toEqual({ a: null, b: undefined });
	});

	it('produces different text for the two forms of the same page', () => {
		const informal = JSON.stringify(resolveBlocks('family', 'ty'));
		const formal = JSON.stringify(resolveBlocks('family', 'vy'));
		expect(informal).not.toBe(formal);
	});
});
