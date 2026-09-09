import type { Handle } from '@sveltejs/kit';

// The invitation links are private. The meta tag covers pages, the header covers
// everything else the server can hand out.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	return response;
};
