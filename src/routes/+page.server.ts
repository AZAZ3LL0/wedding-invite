import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// There is no public entrance. Everything reachable lives behind a personal code.
export const load: PageServerLoad = () => {
	error(404, 'Not found');
};
