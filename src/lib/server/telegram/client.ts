export interface SendOpts {
	replyMarkup?: {
		inline_keyboard: { text: string; callback_data: string }[][];
	};
	disableNotification?: boolean;
}

export interface TelegramClient {
	sendMessage(chatId: number, text: string, opts?: SendOpts): Promise<{ messageId: number }>;
	answerCallback(id: string, text?: string): Promise<void>;
	setWebhook(url: string): Promise<void>;
}

/** Telegram HTTP failures the queue has to tell apart. */
export class TelegramError extends Error {
	constructor(
		readonly statusCode: number,
		message: string
	) {
		super(message);
		this.name = 'TelegramError';
	}

	get isBlocked(): boolean {
		return this.statusCode === 403;
	}

	get isRetryable(): boolean {
		return this.statusCode === 429 || this.statusCode >= 500;
	}
}
