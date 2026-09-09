import { error, fail } from '@sveltejs/kit';
import { loadInvite, markOpened } from '$lib/server/invites';
import { setRsvp, setRsvpInput } from '$lib/server/rsvp';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const invite = await loadInvite(params.code);
	if (!invite) error(404, 'Приглашение не найдено');

	await markOpened(invite.id);

	// Only InviteView crosses to the client. adminComment and other invites never
	// enter this object in the first place.
	return { invite: invite.view };
};

export const actions: Actions = {
	setRsvp: async ({ params, request }) => {
		// Ownership first: an id from another invite must look like a missing guest.
		const invite = await loadInvite(params.code);
		if (!invite) error(404, 'Приглашение не найдено');

		const form = await request.formData();
		const parsed = setRsvpInput.safeParse({
			guestId: form.get('guestId'),
			status: form.get('status')
		});
		if (!parsed.success) {
			return fail(400, { message: 'Проверьте выбранный ответ и повторите.' });
		}

		const result = await setRsvp(invite.id, parsed.data);
		if (!result.ok) {
			return result.reason === 'locked'
				? fail(409, { message: 'Список гостей закрыт. Напишите организаторам.' })
				: fail(404, { message: 'Гость не найден в этом приглашении.' });
		}

		return { message: parsed.data.status === 'accepted' ? 'Подтверждено' : 'Ответ сохранён' };
	}
};
