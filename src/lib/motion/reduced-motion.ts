import { browser } from '$app/environment';

/**
 * Reveal animations are off entirely when the guest asked for reduced motion. This
 * is read at effect time rather than module load so a system change mid session is
 * picked up on the next mount.
 */
export function prefersReducedMotion(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
