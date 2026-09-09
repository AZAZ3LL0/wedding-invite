import type { AddressForm, Copy, Resolved } from './types';

/**
 * Picks the address form, per tech.md section 4.4. The choice happens here and in the
 * server side resolver below, never as a condition inside markup.
 */
export function t(copy: Copy, addressForm: AddressForm): string {
	return typeof copy === 'string' ? copy : copy[addressForm];
}

function isCopyPair(value: object): value is { ty: string; vy: string } {
	return (
		'ty' in value &&
		'vy' in value &&
		typeof (value as { ty: unknown }).ty === 'string' &&
		typeof (value as { vy: unknown }).vy === 'string'
	);
}

/**
 * Walks a props object and replaces every Copy pair with the picked string. Content
 * reaches the client already flattened, so the unused form never ships.
 */
export function resolveCopy<V>(value: V, addressForm: AddressForm): Resolved<V> {
	if (Array.isArray(value)) {
		return value.map((item) => resolveCopy(item, addressForm)) as Resolved<V>;
	}
	if (value !== null && typeof value === 'object') {
		if (isCopyPair(value)) return t(value, addressForm) as Resolved<V>;
		const out: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			out[key] = resolveCopy(item, addressForm);
		}
		return out as Resolved<V>;
	}
	return value as Resolved<V>;
}
