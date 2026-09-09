import { z } from 'zod';

/**
 * Template ids match notification kinds from the schema, so a stored notification row
 * and the message it produced always name the same thing.
 */
export const templateId = z.enum([
	'link_confirm',
	'rsvp_m1',
	'rsvp_w1',
	'rsvp_final',
	'day_before',
	'admin_alert'
]);

export type TemplateId = z.infer<typeof templateId>;

export type TemplateParams = Record<string, string | number>;

type Template = (params: TemplateParams) => string;

// Interface copy is Russian, code stays English.
const templates: Record<TemplateId, Template> = {
	link_confirm: (p) => `${p.greetingName}, приглашение привязано. Статус: ${p.statusLine}.`,
	rsvp_m1: (p) => `${p.greetingName}, до свадьбы месяц. Подтвердите участие: ${p.link}`,
	rsvp_w1: (p) => `${p.greetingName}, до свадьбы неделя. Ждём ответ: ${p.link}`,
	rsvp_final: (p) =>
		`${p.greetingName}, список гостей закрывается. Ответьте, пожалуйста: ${p.link}`,
	day_before: (p) => `${p.greetingName}, завтра начало в ${p.time}, адрес: ${p.address}.`,
	admin_alert: (p) => `Событие: ${p.type}. Приглашение ${p.inviteCode}. ${p.summary}`
};

export function renderTemplate(id: TemplateId, params: TemplateParams): string {
	return templates[id](params);
}

export function isKnownTemplate(id: string): id is TemplateId {
	return templateId.safeParse(id).success;
}
