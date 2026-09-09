import { randomInt } from 'node:crypto';

// Crockford base32 without the characters that get misread out loud or in print.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 10;

const CODE_PATTERN = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);

export function generateInviteCode(): string {
	let code = '';
	for (let i = 0; i < CODE_LENGTH; i += 1) {
		code += ALPHABET[randomInt(ALPHABET.length)];
	}
	return code;
}

/**
 * Guests paste links from messengers, which lowercase and decorate them. Accept the
 * loose form, work with the canonical one.
 */
export function normalizeInviteCode(raw: string): string {
	return raw.trim().toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
}

export function isValidInviteCode(raw: string): boolean {
	return CODE_PATTERN.test(raw);
}
