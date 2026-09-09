import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
	CODE_LENGTH,
	generateInviteCode,
	isValidInviteCode,
	normalizeInviteCode
} from '../../src/lib/server/invites/code';

// Acceptance criteria from tech.md section 10: only a well formed code reaches the
// database, and a link a guest pasted from a messenger still resolves.
describe('invite code', () => {
	it('generates codes that pass the guard', () => {
		fc.assert(
			fc.property(fc.integer({ min: 0, max: 200 }), () => {
				const code = generateInviteCode();
				expect(code).toHaveLength(CODE_LENGTH);
				expect(isValidInviteCode(code)).toBe(true);
			})
		);
	});

	it('rejects the shapes that are not codes', () => {
		expect(isValidInviteCode('')).toBe(false);
		expect(isValidInviteCode('SHORT')).toBe(false);
		expect(isValidInviteCode('FAM4SEAT011')).toBe(false);
		expect(isValidInviteCode('fam4seat01')).toBe(false);
		expect(isValidInviteCode('FAM4SEAT0I')).toBe(false);
		expect(isValidInviteCode('../../etc/pa')).toBe(false);
	});

	it('accepts a code the guest copied with case and lookalike characters', () => {
		expect(normalizeInviteCode(' fam4seato1 ')).toBe('FAM4SEAT01');
		expect(isValidInviteCode(normalizeInviteCode('fam4seato1'))).toBe(true);
	});
});
