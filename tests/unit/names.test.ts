import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { normalizeName } from '../../src/lib/server/rsvp/names';

// Acceptance criteria from tech.md section 4.3: the same person written two ways
// must collapse to the same key, and normalising twice must change nothing.
describe('normalizeName', () => {
	it('collapses the spellings of one person', () => {
		// tech.md deletes hyphens rather than replacing them with a space, so the
		// hyphenated and the glued spelling are the same person, the spaced one is not.
		expect(normalizeName('Анна-Мария', 'Иванова')).toBe(normalizeName(' АННАМАРИЯ ', 'иванова'));
		expect(normalizeName('Анна-Мария', 'Иванова')).not.toBe(normalizeName('Анна Мария', 'Иванова'));
		expect(normalizeName('Артём', 'Соколов')).toBe(normalizeName('Артем', 'СОКОЛОВ'));
		expect(normalizeName("Д'Артаньян", null)).toBe(normalizeName('ДАртаньян', null));
	});

	it('keeps different people apart', () => {
		expect(normalizeName('Пётр', 'Иванов')).not.toBe(normalizeName('Пётр', 'Иванова'));
	});

	it('is idempotent', () => {
		fc.assert(
			fc.property(fc.string(), fc.string(), (first, last) => {
				const once = normalizeName(first, last);
				expect(normalizeName(once, null)).toBe(once);
			})
		);
	});

	it('never returns padding, doubled spaces or folded characters', () => {
		fc.assert(
			fc.property(fc.string(), fc.option(fc.string(), { nil: null }), (first, last) => {
				const result = normalizeName(first, last);
				expect(result).toBe(result.trim());
				expect(result).not.toMatch(/\s\s/);
				expect(result).not.toMatch(/[ё'ʼ’-]/);
				expect(result).toBe(result.toLowerCase());
			})
		);
	});

	it('treats a missing name as an empty key', () => {
		expect(normalizeName(null, null)).toBe('');
	});
});
