import type {
	AgeGroup,
	Audience,
	AddressForm,
	GuestOrigin,
	PlusOnePolicy,
	RsvpStatus
} from '$lib/types';

/**
 * One fixture set for the seed script, the fake Telegram client and the tests.
 * tech.md section 14 fixes what it has to cover: every branch of the domain has an
 * invite here, so a slice can be exercised without inventing data.
 */

export interface GuestFixture {
	firstName: string | null;
	lastName: string | null;
	origin: GuestOrigin;
	isPrimary: boolean;
	ageGroup: AgeGroup;
	rsvp: RsvpStatus;
}

export interface ChatFixture {
	chatId: number;
	username: string | null;
	tgFirstName: string | null;
	isBlocked: boolean;
}

export interface SeatRequestFixture {
	extraSeats: number;
	comment: string | null;
}

export interface InviteFixture {
	code: string;
	partyKey: string | null;
	greetingName: string;
	category: Audience;
	addressForm: AddressForm;
	seats: number;
	plusOnePolicy: PlusOnePolicy;
	personalNote: string | null;
	adminComment: string | null;
	guests: GuestFixture[];
	chat: ChatFixture | null;
	seatRequest: SeatRequestFixture | null;
}

function guest(
	firstName: string | null,
	lastName: string | null,
	overrides: Partial<GuestFixture> = {}
): GuestFixture {
	return {
		firstName,
		lastName,
		origin: 'preset',
		isPrimary: false,
		ageGroup: 'adult',
		rsvp: 'pending',
		...overrides
	};
}

export const inviteFixtures: InviteFixture[] = [
	{
		code: 'FAM4SEAT01',
		partyKey: null,
		greetingName: 'Семья Ивановых',
		category: 'family',
		addressForm: 'ty',
		seats: 4,
		plusOnePolicy: 'none',
		personalNote: 'Ждём вас всей семьёй, места за нашим столом уже отмечены.',
		adminComment: 'Тётя со стороны невесты, звонить только вечером.',
		guests: [
			guest('Ирина', 'Иванова', { isPrimary: true }),
			guest('Пётр', 'Иванов'),
			guest('Мария', 'Иванова'),
			guest('Никита', 'Иванов', { ageGroup: 'teen' })
		],
		chat: { chatId: 100000001, username: 'irina_iv', tgFirstName: 'Ирина', isBlocked: false },
		seatRequest: null
	},
	{
		code: 'FRNDNAMED2',
		partyKey: null,
		greetingName: 'Дмитрий',
		category: 'friends',
		addressForm: 'ty',
		seats: 2,
		plusOnePolicy: 'named',
		personalNote: null,
		adminComment: null,
		guests: [guest('Дмитрий', 'Кузнецов', { isPrimary: true, rsvp: 'accepted' })],
		chat: { chatId: 100000002, username: 'dkuz', tgFirstName: 'Дмитрий', isBlocked: false },
		seatRequest: null
	},
	{
		code: 'VPENSEAT44',
		partyKey: null,
		greetingName: 'Артём',
		category: 'friends',
		addressForm: 'ty',
		seats: 2,
		plusOnePolicy: 'open',
		personalNote: 'Приходи с кем захочешь, имя скажешь позже.',
		adminComment: null,
		guests: [guest('Артём', 'Соколов', { isPrimary: true })],
		chat: { chatId: 100000003, username: null, tgFirstName: 'Артём', isBlocked: false },
		seatRequest: null
	},
	{
		code: 'FAMKDSEAT5',
		partyKey: null,
		greetingName: 'Ольга и Сергей',
		category: 'family',
		addressForm: 'vy',
		seats: 3,
		plusOnePolicy: 'none',
		personalNote: null,
		adminComment: null,
		guests: [
			guest('Ольга', 'Петрова', { isPrimary: true }),
			guest('Сергей', 'Петров'),
			guest('Лиза', 'Петрова', { ageGroup: 'child' })
		],
		chat: { chatId: 100000004, username: 'olga_p', tgFirstName: 'Ольга', isBlocked: false },
		seatRequest: null
	},
	{
		code: 'CWRKSEATR6',
		partyKey: null,
		greetingName: 'Анна Романовна',
		category: 'colleagues',
		addressForm: 'vy',
		seats: 1,
		plusOnePolicy: 'named',
		personalNote: null,
		adminComment: 'Руководитель отдела, приглашение отправлено через секретаря.',
		guests: [guest('Анна', 'Романова', { isPrimary: true, rsvp: 'accepted' })],
		chat: { chatId: 100000005, username: 'anna_r', tgFirstName: 'Анна', isBlocked: false },
		seatRequest: { extraSeats: 1, comment: 'Приду с мужем, если получится.' }
	},
	{
		code: 'BKDCHATS77',
		partyKey: null,
		greetingName: 'Егор',
		category: 'friends',
		addressForm: 'ty',
		seats: 2,
		plusOnePolicy: 'named',
		personalNote: null,
		adminComment: 'Бот заблокирован, нужен ручной обзвон.',
		guests: [guest('Егор', 'Морозов', { isPrimary: true })],
		chat: { chatId: 100000006, username: 'egorm', tgFirstName: 'Егор', isBlocked: true },
		seatRequest: null
	},
	{
		code: 'PARTYAAA88',
		partyKey: 'couple',
		greetingName: 'Владимир',
		category: 'family',
		addressForm: 'vy',
		seats: 1,
		plusOnePolicy: 'none',
		personalNote: null,
		adminComment: null,
		guests: [guest('Владимир', 'Белов', { isPrimary: true })],
		chat: { chatId: 100000007, username: 'vbelov', tgFirstName: 'Владимир', isBlocked: false },
		seatRequest: null
	},
	{
		code: 'PARTYBBB99',
		partyKey: 'couple',
		greetingName: 'Наталья',
		category: 'family',
		addressForm: 'vy',
		seats: 1,
		plusOnePolicy: 'none',
		personalNote: null,
		adminComment: 'Телефон вместо телеграма: обзванивать вручную.',
		guests: [guest('Наталья', 'Белова', { isPrimary: true })],
		chat: null,
		seatRequest: null
	}
];

export interface QuestionFixture {
	key: string;
	type: 'single' | 'multi' | 'text';
	title: string;
	hint: string | null;
	options: { value: string; label: string }[];
	audience: Audience[];
	appliesTo: AgeGroup[];
	required: boolean;
	sort: number;
}

export const questionFixtures: QuestionFixture[] = [
	{
		key: 'meal',
		type: 'single',
		title: 'Что подать на горячее',
		hint: null,
		options: [
			{ value: 'meat', label: 'Мясо' },
			{ value: 'fish', label: 'Рыба' },
			{ value: 'veg', label: 'Вегетарианское' }
		],
		audience: ['family', 'friends', 'colleagues'],
		appliesTo: ['adult', 'teen', 'child'],
		required: true,
		sort: 10
	},
	{
		key: 'allergies',
		type: 'text',
		title: 'Аллергия или ограничения в еде',
		hint: 'Напишите, что исключить. Пустое поле означает «ограничений нет».',
		options: [],
		audience: ['family', 'friends', 'colleagues'],
		appliesTo: ['adult', 'teen', 'child'],
		required: false,
		sort: 20
	},
	{
		key: 'transfer',
		type: 'single',
		title: 'Нужен трансфер от города до площадки',
		hint: null,
		options: [
			{ value: 'yes', label: 'Да' },
			{ value: 'no', label: 'Доберусь сам' }
		],
		audience: ['family', 'friends', 'colleagues'],
		appliesTo: ['adult', 'teen'],
		required: true,
		sort: 30
	},
	{
		key: 'drinks',
		type: 'multi',
		title: 'Что налить на приветственном фуршете',
		hint: null,
		options: [
			{ value: 'wine_red', label: 'Красное вино' },
			{ value: 'wine_white', label: 'Белое вино' },
			{ value: 'soft', label: 'Безалкогольное' }
		],
		audience: ['family', 'friends'],
		appliesTo: ['adult'],
		required: false,
		sort: 40
	}
];

export const chatFixtures = inviteFixtures
	.filter((invite): invite is InviteFixture & { chat: ChatFixture } => invite.chat !== null)
	.map((invite) => ({
		...invite.chat,
		inviteCode: invite.code,
		greetingName: invite.greetingName
	}));
