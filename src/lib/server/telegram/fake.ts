import { chatFixtures } from '$lib/server/db/fixtures';
import { TelegramError, type SendOpts, type TelegramClient } from './client';
import { isKnownTemplate, renderTemplate, type TemplateId, type TemplateParams } from './templates';

export interface SentMessage {
	messageId: number;
	chatId: number;
	text: string;
	opts: SendOpts | undefined;
	sentAt: Date;
}

export interface FakeChat {
	chatId: number;
	inviteCode: string;
	greetingName: string;
	username: string | null;
	tgFirstName: string | null;
	isBlocked: boolean;
}

export interface FakeFailure {
	/** Http status the next sends answer with. 403 marks the chat blocked. */
	statusCode: 403 | 429 | 500;
	/** How many sends fail before the fake goes back to succeeding. */
	times: number;
}

/**
 * Stands in for Telegram in development and in every test. It keeps sends in memory,
 * answers with the seeded chats, fails on demand and rejects text that no template
 * could have produced, which is what makes it a test seam rather than a stub.
 */
export class FakeTelegramClient implements TelegramClient {
	readonly sent: SentMessage[] = [];
	readonly callbacks: { id: string; text?: string }[] = [];
	webhookUrl: string | null = null;

	private chats = new Map<number, FakeChat>();
	private failure: FakeFailure | null = null;
	private nextMessageId = 1;

	constructor(chats: FakeChat[] = seedChats()) {
		for (const chat of chats) this.chats.set(chat.chatId, { ...chat });
	}

	/** Seeded chats, same rows the seed script writes into telegram_chats. */
	listChats(): FakeChat[] {
		return [...this.chats.values()];
	}

	getChat(chatId: number): FakeChat | undefined {
		return this.chats.get(chatId);
	}

	failNext(failure: FakeFailure): void {
		this.failure = { ...failure };
	}

	reset(): void {
		this.sent.length = 0;
		this.callbacks.length = 0;
		this.failure = null;
		this.nextMessageId = 1;
		this.chats = new Map(seedChats().map((chat) => [chat.chatId, chat]));
	}

	async sendMessage(chatId: number, text: string, opts?: SendOpts): Promise<{ messageId: number }> {
		const chat = this.chats.get(chatId);
		if (!chat) throw new TelegramError(400, `Bad Request: chat not found (${chatId})`);
		if (chat.isBlocked) throw new TelegramError(403, 'Forbidden: bot was blocked by the user');
		if (!text.trim()) throw new TelegramError(400, 'Bad Request: message text is empty');

		if (this.failure && this.failure.times > 0) {
			this.failure.times -= 1;
			const { statusCode } = this.failure;
			if (this.failure.times === 0) this.failure = null;
			if (statusCode === 403) chat.isBlocked = true;
			throw new TelegramError(statusCode, `Telegram responded ${statusCode}`);
		}

		const messageId = this.nextMessageId++;
		this.sent.push({ messageId, chatId, text, opts, sentAt: new Date() });
		return { messageId };
	}

	async answerCallback(id: string, text?: string): Promise<void> {
		this.callbacks.push({ id, text });
	}

	async setWebhook(url: string): Promise<void> {
		this.webhookUrl = url;
	}

	/**
	 * Sends through a template. A slice that builds its own text bypasses this and
	 * fails the template check in tests, which is the point.
	 */
	async sendTemplate(
		chatId: number,
		template: TemplateId,
		params: TemplateParams,
		opts?: SendOpts
	): Promise<{ messageId: number }> {
		if (!isKnownTemplate(template)) {
			throw new TelegramError(400, `Unknown template: ${template}`);
		}
		return this.sendMessage(chatId, renderTemplate(template, params), opts);
	}

	sentTo(chatId: number): SentMessage[] {
		return this.sent.filter((message) => message.chatId === chatId);
	}
}

function seedChats(): FakeChat[] {
	return chatFixtures.map((chat) => ({
		chatId: chat.chatId,
		inviteCode: chat.inviteCode,
		greetingName: chat.greetingName,
		username: chat.username,
		tgFirstName: chat.tgFirstName,
		isBlocked: chat.isBlocked
	}));
}
