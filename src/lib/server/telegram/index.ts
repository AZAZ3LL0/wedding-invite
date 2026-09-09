import { config } from '$lib/server/config';
import type { TelegramClient } from './client';
import { FakeTelegramClient } from './fake';

let client: TelegramClient | null = null;

/**
 * Development and tests always run against the fake. The real grammY client arrives
 * with the bot slice in stage 4; until then a production token is a configuration
 * error worth failing loudly on.
 */
export function telegram(): TelegramClient {
	if (client) return client;
	if (config.USE_FAKE_TELEGRAM) {
		client = new FakeTelegramClient();
		return client;
	}
	throw new Error('Real Telegram client lands with the bot slice, set USE_FAKE_TELEGRAM=true');
}

export function setTelegramClient(next: TelegramClient | null): void {
	client = next;
}

export type { TelegramClient };
export { FakeTelegramClient };
