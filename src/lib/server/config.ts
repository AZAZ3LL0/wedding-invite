import 'dotenv/config';
import { z } from 'zod';

// The app must not boot half configured: a missing variable is a startup crash,
// not a runtime surprise on the guest page.
const schema = z.object({
	DATABASE_URL: z.string().min(1),
	ORIGIN: z.string().url(),
	WEDDING_DATE: z.iso.datetime({ offset: true }),
	RSVP_LOCK_AT: z.iso.datetime({ offset: true }),
	TELEGRAM_BOT_TOKEN: z.string().default(''),
	TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
	TELEGRAM_ADMIN_CHAT_ID: z.string().default(''),
	ADMIN_PASSWORD_HASH: z.string().default(''),
	USE_FAKE_TELEGRAM: z
		.enum(['true', 'false'])
		.default('true')
		.transform((value) => value === 'true')
});

export type Config = z.infer<typeof schema> & {
	weddingDate: Date;
	rsvpLockAt: Date;
};

function load(): Config {
	const parsed = schema.safeParse(process.env);
	if (!parsed.success) {
		const details = parsed.error.issues
			.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
			.join('; ');
		throw new Error(`Invalid environment: ${details}`);
	}
	return {
		...parsed.data,
		weddingDate: new Date(parsed.data.WEDDING_DATE),
		rsvpLockAt: new Date(parsed.data.RSVP_LOCK_AT)
	};
}

export const config: Config = load();

// The whole project reports and formats in Moscow time, storage stays UTC.
export const TIME_ZONE = 'Europe/Moscow';
