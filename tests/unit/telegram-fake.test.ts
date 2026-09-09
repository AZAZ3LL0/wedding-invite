import { beforeEach, describe, expect, it } from 'vitest';
import { TelegramError } from '../../src/lib/server/telegram/client';
import { FakeTelegramClient } from '../../src/lib/server/telegram/fake';
import { chatFixtures } from '../../src/lib/server/db/fixtures';

let telegram: FakeTelegramClient;

beforeEach(() => {
	telegram = new FakeTelegramClient();
});

// Acceptance criteria from tech.md sections 6.4 and 13: the fake answers with the
// seeded chats, records what a slice sent, and reproduces the failures the queue has
// to survive.
describe('FakeTelegramClient', () => {
	it('serves the seeded chats', () => {
		expect(telegram.listChats()).toHaveLength(chatFixtures.length);
		const chat = telegram.getChat(100000001);
		expect(chat?.inviteCode).toBe('FAM4SEAT01');
	});

	it('records every send with its chat and text', async () => {
		const { messageId } = await telegram.sendMessage(100000001, 'Проверка связи');
		expect(messageId).toBe(1);
		expect(telegram.sentTo(100000001)).toEqual([
			expect.objectContaining({ chatId: 100000001, text: 'Проверка связи' })
		]);
	});

	it('renders a template instead of trusting free text', async () => {
		await telegram.sendTemplate(100000002, 'rsvp_w1', {
			greetingName: 'Дмитрий',
			link: 'https://example.ru/FRNDNAMED2'
		});
		expect(telegram.sent[0].text).toContain('до свадьбы неделя');
		expect(telegram.sent[0].text).toContain('https://example.ru/FRNDNAMED2');
	});

	it('refuses a chat that never linked', async () => {
		await expect(telegram.sendMessage(999, 'Привет')).rejects.toBeInstanceOf(TelegramError);
	});

	it('reports a blocked chat as 403 and stays blocked', async () => {
		const error = await telegram.sendMessage(100000006, 'Привет').catch((e: unknown) => e);
		expect(error).toBeInstanceOf(TelegramError);
		expect((error as TelegramError).statusCode).toBe(403);
		expect((error as TelegramError).isBlocked).toBe(true);
		expect(telegram.sent).toHaveLength(0);
	});

	it('marks the chat blocked once Telegram answers 403', async () => {
		telegram.failNext({ statusCode: 403, times: 1 });
		await expect(telegram.sendMessage(100000001, 'Привет')).rejects.toBeInstanceOf(TelegramError);
		expect(telegram.getChat(100000001)?.isBlocked).toBe(true);
	});

	it('fails the configured number of times and then succeeds', async () => {
		telegram.failNext({ statusCode: 429, times: 2 });
		for (let attempt = 0; attempt < 2; attempt += 1) {
			const error = await telegram.sendMessage(100000001, 'Привет').catch((e: unknown) => e);
			expect((error as TelegramError).isRetryable).toBe(true);
		}
		await expect(telegram.sendMessage(100000001, 'Привет')).resolves.toEqual({ messageId: 1 });
		expect(telegram.sent).toHaveLength(1);
	});

	it('treats a server error as retryable', async () => {
		telegram.failNext({ statusCode: 500, times: 1 });
		const error = await telegram.sendMessage(100000001, 'Привет').catch((e: unknown) => e);
		expect((error as TelegramError).isRetryable).toBe(true);
		expect((error as TelegramError).isBlocked).toBe(false);
	});
});
