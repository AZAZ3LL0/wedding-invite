# tech.md — ядро проекта «Сайт-приглашение на свадьбу»

**Версия ядра: v1**

Changelog:
- v1 — первичная фиксация: стек, схема БД, контракты очереди и Telegram, типы, список UI-примитивов, дизайн-токены, стратегия тестов, дорожная карта.

Правила файла: источник истины для всего проекта. Меняется только append-only, каждое изменение контракта (схема БД, payload джоба, публичный тип, формат роута) бампает версию и добавляет строку в changelog. Код, который противоречит этому файлу, не мёржится.

---

## 1. Проект

Персональный сайт-приглашение на свадьбу с закрытым доступом по индивидуальной ссылке, сбором RSVP и Telegram-ботом, который напоминает о подтверждении и добирает ответы перед датой.

Аудитория: гости свадьбы, две основные категории — родственники и друзья, плюс коллеги. Категория меняет содержимое страницы (тон обращения, состав блоков, часть программы дня), а не только приветствие.

Цели:
1. Гость открывает ссылку и видит приглашение, адресованное лично ему, без регистрации и паролей.
2. Организаторы получают точный список: кто идёт, с кем, что ест, нужен ли трансфер.
3. Бот сам добирает недостающие подтверждения за месяц и за несколько дней до даты, вместо ручного обзвона.
4. Пары и «плюс один» учтены как места, а не как галочка: система всегда знает, сколько человек придёт и кто именно.

Разработчик один. Тяжёлых процессов нет, но гейты (типы, тесты, миграции) остаются.

Нефункциональные требования:
- LCP < 2.0 s на 4G, JS-бандл страницы гостя < 130 KB gzip, CLS < 0.05.
- Мобильный трафик — основной, дизайн проектируется от 360 px.
- Сайт не индексируется: `noindex`, `Disallow: /`, ссылки гостей не публикуются.
- Данные гостей не пересекаются между приглашениями. Все запросы авторизуются серверно по коду приглашения.
- Часовой пояс всего проекта: `Europe/Moscow`. В БД всё в UTC (`timestamptz`), форматирование — на сервере.

---

## 2. Стек

- SvelteKit 2 (fullstack), Svelte 5 (runes), TypeScript strict.
- adapter-node, Caddy как reverse-proxy и TLS.
- PostgreSQL 16, Drizzle ORM, drizzle-kit для миграций.
- pg-boss 10 — очередь и cron внутри того же Postgres. Отдельный воркер-процесс.
- grammY — Telegram-бот, режим webhook, эндпоинт в том же SvelteKit-приложении.
- Zod — валидация всех внешних входов: формы, webhook, payload джобов, env.
- Тесты: vitest (unit + integration), Playwright (e2e), fast-check (property-based на чистой доменной логике).
- Линт: eslint + prettier, `svelte-check` для тайпчека.
- Изображения: sharp на этапе сборки, AVIF + WebP, srcset. Никаких внешних CDN.
- Пакетный менеджер: pnpm.
- Хостинг: один VPS, Docker Compose (app, worker, postgres, caddy). Автодеплой из `main`.

Запрещено без явного апдейта этого файла: добавлять UI-фреймворк (Tailwind достаточен), тянуть анимационные библиотеки тяжелее 15 KB gzip, использовать сторонние конструкторы форм, выносить данные гостей в сторонние сервисы (Google Forms, Airtable, аналитика с cookie).

---

## 3. Структура папок

```
src/
  lib/
    types/                  общие TypeScript-типы, источник истины для доменных форм
    server/
      db/
        schema.ts           Drizzle-схема, только здесь
        index.ts            клиент
        seed.ts             сид-скрипт
      invites/              домен приглашений и гостей
      rsvp/                 домен ответов, мест, компаньонов
      telegram/             клиент бота за интерфейсом + фейк
      queue/
        boss.ts             инициализация pg-boss
        jobs/               хендлеры джобов, по файлу на топик
        contracts.ts        zod-схемы payload, экспорт типов
      notifications/        дедупликация и запись отправок
      admin/                сессии администратора
    content/                контент сайта как типизированные модули (см. §8)
    ui/                     примитивы (Button, Input, Modal, ...)
    motion/                 Reveal, Parallax, утилиты анимации
    styles/                 токены, глобальные стили
  routes/
    (guest)/[code]/         страница приглашения и RSVP-мастер
    (admin)/admin/          админка
    api/telegram/webhook/   вебхук бота
    api/health/
worker/
  index.ts                  процесс pg-boss
static/
tests/
  e2e/
drizzle/                    сгенерированные миграции
```

Эталонный вертикальный слайс: `routes/(guest)/[code]/rsvp`. Любая новая фича повторяет его раскладку: домен в `lib/server/<домен>` → `load` / actions в `+page.server.ts` → страница → локальные компоненты рядом со страницей.

---

## 4. Доменная модель

### 4.1 Ключевое решение: приглашение = «партия мест»

Единица приглашения — **invite**, не человек. У invite есть:
- `seats` — сколько человек эта ссылка может привести максимум;
- список **guests** — поимённые гости; изначально заполнены организаторами (`origin = 'preset'`);
- политика спутников `plusOnePolicy`.

Гость никогда не «отмечает +1 галочкой». Он **добавляет человека**, и тот становится полноценной строкой `guests` со своим статусом и своей анкетой. Причина: кухне нужен выбор блюда на каждого, рассадке — имя, трансферу — количество тел. Счётчик этого не даёт.

`plusOnePolicy`:
- `none` — добавлять некого, все места заняты пресетом. Блок «привести спутника» не рендерится.
- `named` — свободные места есть, спутника нужно назвать по имени. Основной сценарий.
- `open` — гость может привести спутника, имя может указать позже (`guests.firstName = null` до уточнения). Ставится только VIP-гостям.

### 4.2 Свободные места и запрос сверх лимита

`freeSeats = invite.seats − count(guests where rsvp != 'declined')`.

Если гость хочет привести больше, чем `freeSeats`, форма не блокирует его молча: создаётся `seat_request` со статусом `pending`, гость видит «запрос отправлен, подтвердим отдельно», админ решает в панели. Approve увеличивает `invite.seats` и переводит добавленных гостей в активные; reject — оставляет их в `rsvp = 'declined'` с пометкой. Так «один регается, но придёт с парой» всегда попадает в систему, а не теряется в личных сообщениях.

### 4.3 Дубли пары

Проблема: муж и жена получили две разные ссылки, каждый добавил другого спутником — в списке четыре человека вместо двух.

Три защиты:
1. `invites.partyId` — если пара приглашена вместе, обе ссылки указывают на одну партию. При открытии второй ссылки гость видит уже сделанный ответ первого и не может добавить того же человека повторно.
2. Уникальный индекс по нормализованному имени внутри приглашения — один и тот же человек не добавится дважды в одну ссылку.
3. Админский экран «Возможные дубли»: сравнение нормализованных пар «фамилия + имя» по всем приглашениям, ручное слияние. Автоматического слияния нет, имена совпадают слишком часто.

Нормализация имени (чистая функция, покрывается property-based тестами): trim, схлопывание пробелов, нижний регистр, `ё → е`, удаление дефисов и апострофов.

### 4.4 Категории и сегментация контента

`invites.category ∈ ('family','friends','colleagues')`. Каждый контент-блок объявляет `audience: Audience[]`. Фильтрация происходит **на сервере в `load`**: в HTML не попадают блоки чужой аудитории. Клиентское скрытие запрещено.

`invites.addressForm ∈ ('ty','vy')` управляет обращением. Все тексты хранятся парами форм либо пишутся нейтрально; выбор формы делает хелпер `t(copy, addressForm)`, а не условия в разметке.

### 4.5 Статусы RSVP

`guests.rsvp ∈ ('pending','accepted','declined')`. Промежуточного «может быть» нет — он ломает подсчёт для ресторана. Сомневающийся остаётся `pending` и получает напоминания.

Ответ можно менять до `RSVP_LOCK_AT` (дата из конфига, обычно за 3 дня). После — форма read-only, показывается контакт организатора. Каждое изменение пишется в `rsvp_events`.

---

## 5. Схема БД (Drizzle, `lib/server/db/schema.ts`)

Enum-ы объявляются как pgEnum. Все `id` — `uuid` с `defaultRandom()`. Все таблицы имеют `createdAt`/`updatedAt` (`timestamptz`, default `now()`).

```ts
export const audienceEnum   = pgEnum('audience', ['family', 'friends', 'colleagues']);
export const addressFormEnum= pgEnum('address_form', ['ty', 'vy']);
export const plusOneEnum    = pgEnum('plus_one_policy', ['none', 'named', 'open']);
export const rsvpEnum       = pgEnum('rsvp_status', ['pending', 'accepted', 'declined']);
export const guestOriginEnum= pgEnum('guest_origin', ['preset', 'companion']);
export const ageGroupEnum   = pgEnum('age_group', ['adult', 'teen', 'child']);
export const seatReqEnum    = pgEnum('seat_request_status', ['pending', 'approved', 'rejected']);
export const actorEnum      = pgEnum('actor', ['guest', 'admin', 'bot', 'system']);
export const notifyKindEnum = pgEnum('notification_kind', [
  'link_confirm',      // бот привязан, подтверждение
  'rsvp_m1',           // T-30 дней
  'rsvp_w1',           // T-7 дней
  'rsvp_final',        // T-2 дня, последний сбор
  'day_before',        // T-1, логистика
  'admin_alert'        // организатору
]);
```

**invites**
| поле | тип | примечание |
|---|---|---|
| id | uuid pk | |
| code | text unique not null | 10 символов, Crockford base32, без похожих символов |
| partyId | uuid null | связывает ссылки одной пары/семьи |
| greetingName | text not null | «Анна и Пётр», «Дорогая тётя Лена» |
| category | audienceEnum not null | |
| addressForm | addressFormEnum not null default 'vy' | |
| seats | integer not null default 1 | |
| plusOnePolicy | plusOneEnum not null default 'none' | |
| personalNote | text null | абзац лично для этой ссылки, рендерится в блоке приглашения |
| adminComment | text null | не показывается гостю никогда |
| firstOpenedAt | timestamptz null | ставится один раз |
| lastOpenedAt | timestamptz null | |
| rsvpCompletedAt | timestamptz null | все гости приглашения ответили |

Индексы: `unique(code)`, `index(partyId)`, `index(category)`.

**guests**
| поле | тип | примечание |
|---|---|---|
| id | uuid pk | |
| inviteId | uuid fk invites.id on delete cascade | |
| firstName | text null | null допустим только при `plusOnePolicy='open'` |
| lastName | text null | |
| origin | guestOriginEnum not null | |
| addedByGuestId | uuid null fk guests.id | кто привёл спутника |
| isPrimary | boolean not null default false | ровно один primary на invite |
| ageGroup | ageGroupEnum not null default 'adult' | |
| rsvp | rsvpEnum not null default 'pending' | |
| rsvpAt | timestamptz null | |
| seatConfirmed | boolean not null default true | false, пока висит seat_request |

Индексы: `index(inviteId)`, `unique(inviteId, normalizedName)` через generated column или уникальный индекс по выражению, `index(rsvp)`.

**questions** (анкета, сидируется, не редактируется гостем)
`key text pk`, `type ('single'|'multi'|'text')`, `title text`, `hint text null`, `options jsonb` (`{value,label}[]`), `audience audienceEnum[] not null`, `appliesTo ageGroupEnum[] not null`, `required boolean`, `sort integer`.

**guest_answers**
`id uuid pk`, `guestId uuid fk cascade`, `questionKey text fk questions.key`, `value jsonb not null`, `updatedAt`. Уникально `(guestId, questionKey)`. Запись через upsert.

**seat_requests**
`id uuid pk`, `inviteId uuid fk`, `requestedByGuestId uuid fk`, `extraSeats integer not null`, `comment text null`, `status seatReqEnum not null default 'pending'`, `decidedAt timestamptz null`, `decidedBy text null`.

**telegram_chats**
`id uuid pk`, `chatId bigint unique not null`, `inviteId uuid fk`, `username text null`, `tgFirstName text null`, `linkedAt timestamptz not null`, `isBlocked boolean not null default false`, `lastInteractionAt timestamptz null`.
Одно приглашение может иметь несколько чатов (муж и жена оба привязались) — рассылка идёт во все непроблокированные.

**notifications**
`id uuid pk`, `inviteId uuid fk`, `chatId bigint null`, `kind notifyKindEnum not null`, `dedupeKey text unique not null`, `scheduledFor timestamptz not null`, `sentAt timestamptz null`, `telegramMessageId bigint null`, `attempts integer not null default 0`, `lastError text null`.
Это таблица дедупликации отправок, см. §6.3.

**rsvp_events** (аудит, только append)
`id uuid pk`, `inviteId uuid fk`, `guestId uuid null`, `actor actorEnum not null`, `type text not null`, `payload jsonb not null`, `createdAt`.
Типы: `invite_opened`, `rsvp_set`, `companion_added`, `companion_removed`, `answers_saved`, `seat_requested`, `seat_decided`, `tg_linked`, `tg_blocked`.

**admin_sessions**
`id uuid pk`, `tokenHash text unique not null`, `expiresAt timestamptz not null`, `createdIp text null`.

Правило миграций: схема правится только здесь, миграции генерятся `drizzle-kit generate`, применяются шагом деплоя и в CI на эфемерном Postgres. Руками SQL-миграции не пишутся.

---

## 6. Контракты очереди (pg-boss)

Zod-схемы лежат в `lib/server/queue/contracts.ts`, типы выводятся из них через `z.infer`. Хендлер не принимает нетипизированный payload: первым делом `schema.parse(job.data)`.

### 6.1 Топики

| топик | триггер | payload | ретраи |
|---|---|---|---|
| `reminders.scan` | cron `0 9 * * *` (Europe/Moscow) | `{}` | 3, backoff |
| `reminders.send` | из scan | `{ inviteId, kind, dedupeKey }` | 5, backoff, expire 5 мин |
| `telegram.send` | из reminders.send и rsvp-домена | `{ chatId, template, params, dedupeKey, inviteId }` | 5, backoff |
| `admin.notify` | изменения RSVP, seat_request | `{ type, inviteId, summary }` | 3 |

`reminders.scan` не шлёт сообщений. Он считает даты относительно `WEDDING_DATE` и ставит `reminders.send` для приглашений, у которых есть непроотвеченные гости и живой чат. Расписание: `rsvp_m1` = T−30, `rsvp_w1` = T−7, `rsvp_final` = T−2, `day_before` = T−1 (последнее — всем принявшим, не только `pending`).

### 6.2 Формат dedupeKey

- напоминания: `${inviteId}:${kind}`
- логистика: `${inviteId}:day_before`
- уведомление админу: `${inviteId}:${type}:${isoMinute}`

### 6.3 Правило идемпотентности (обязательное)

Любая отправка сначала резервирует строку в `notifications`:

```
INSERT INTO notifications (invite_id, kind, dedupe_key, scheduled_for)
VALUES (...) ON CONFLICT (dedupe_key) DO NOTHING RETURNING id;
```

Нет `RETURNING`-строки → сообщение уже отправлено или в процессе, хендлер завершается успехом и **ничего не шлёт**. После успешного вызова Telegram проставляется `sentAt` и `telegramMessageId`. При ошибке инкрементится `attempts`, пишется `lastError`, джоб падает и уходит в ретрай; резерв остаётся, повтор идёт по тому же ключу.

Тест идемпотентности обязателен для каждого хендлера: два прогона с тем же payload → ровно один эффект.

### 6.4 Внешний клиент за интерфейсом

```ts
export interface TelegramClient {
  sendMessage(chatId: number, text: string, opts?: SendOpts): Promise<{ messageId: number }>;
  answerCallback(id: string, text?: string): Promise<void>;
  setWebhook(url: string): Promise<void>;
}
```

`FakeTelegramClient` в `lib/server/telegram/fake.ts` пишет отправки в память, умеет возвращать 429 и 500 по флагу, валидирует текст против шаблонов. Разработка и все тесты идут против фейка. Реальный клиент включается только по `TELEGRAM_BOT_TOKEN` в проде.

---

## 7. Контракт Telegram-бота

Привязка: на странице приглашения кнопка ведёт на `https://t.me/<bot>?start=<code>`. Хендлер `/start` находит invite по коду, создаёт `telegram_chats`, пишет событие `tg_linked`, отправляет `link_confirm` с текущим статусом гостей.

Команды: `/start <code>`, `/status` (кто из моего приглашения как ответил), `/help`.

Callback-данные — строго `action:payload`, длина ≤ 64 байт:
- `rsvp:yes:<guestId>`
- `rsvp:no:<guestId>`
- `companion:add:<inviteId>` — ведёт на сайт, бот не собирает имена спутников (клавиатура для этого плохой инструмент, форма лучше)
- `open:site:<code>`

Правила:
- Бот меняет только `rsvp`. Анкета, спутники и запросы мест — только на сайте.
- После нажатия исходное сообщение редактируется (`editMessageText`), кнопки убираются. Повторный колбэк по обработанному сообщению отвечает «уже учтено» и не создаёт события.
- `403 Forbidden: bot was blocked` → `telegram_chats.isBlocked = true`, рассылка на этот чат прекращается, приглашение попадает в админский список «нужен ручной обзвон».
- Гости без Telegram существуют всегда. Админка обязана показывать их отдельным срезом с телефонами.

Webhook: `POST /api/telegram/webhook/<WEBHOOK_SECRET>`, проверка `X-Telegram-Bot-Api-Secret-Token`, ответ 200 всегда и быстро; обработка ставится в очередь, не выполняется в хендлере запроса.

---

## 8. Контент как код

Контент лежит в `lib/content/*.ts` типизированными модулями, не в БД. Причина: контент правит один человек, ему нужен git-дифф и превью в PR, а не CRUD-админка.

```ts
export type Audience = 'family' | 'friends' | 'colleagues';

export interface ContentBlock {
  id: string;
  audience: Audience[];       // пустой массив запрещён
  component: BlockComponent;  // 'hero' | 'invitation' | 'timeline' | ...
  props: Record<string, unknown>;
}
```

Блоки: `hero`, `countdown`, `invitation`, `timeline`, `loveStory`, `dressCode`, `venue`, `faq`, `rsvp`, `contacts`.

Пример сегментации: `timeline` для `family` содержит утро невесты и ЗАГС, для `friends` — начинается со сбора гостей; `dressCode` для `colleagues` мягче по формулировкам. Разные версии — разные блоки с разной `audience`, а не условия внутри компонента.

---

## 9. Общие типы (`lib/types`)

```ts
export type RsvpStatus = 'pending' | 'accepted' | 'declined';
export type GuestOrigin = 'preset' | 'companion';
export type AgeGroup = 'adult' | 'teen' | 'child';

export interface GuestView {
  id: string;
  firstName: string | null;
  lastName: string | null;
  origin: GuestOrigin;
  ageGroup: AgeGroup;
  rsvp: RsvpStatus;
  isPrimary: boolean;
  addedByGuestId: string | null;
  answers: Record<string, AnswerValue>;
}

export type AnswerValue = string | string[] | null;

export interface InviteView {
  code: string;
  greetingName: string;
  category: Audience;
  addressForm: 'ty' | 'vy';
  seats: number;
  freeSeats: number;
  plusOnePolicy: 'none' | 'named' | 'open';
  personalNote: string | null;
  guests: GuestView[];
  telegramLinked: boolean;
  rsvpLocked: boolean;
  pendingSeatRequest: SeatRequestView | null;
}
```

`InviteView` — единственная форма, которой оперирует страница гостя. Сырые строки БД в компоненты не попадают. `adminComment` в `InviteView` отсутствует по определению.

---

## 10. Роуты и их контракты

| роут | назначение |
|---|---|
| `GET /` | заглушка, 404-подобная. Публичного входа нет |
| `GET /[code]` | страница приглашения. 404 при неизвестном коде, задержка ответа выравнивается, чтобы не отличать «нет кода» от «есть» по таймингу |
| `POST /[code]?/setRsvp` | `{ guestId, status }` |
| `POST /[code]?/addCompanion` | `{ firstName, lastName, ageGroup }` → создаёт гостя или seat_request |
| `POST /[code]?/removeCompanion` | `{ guestId }`, только `origin='companion'`, только до `RSVP_LOCK_AT` |
| `POST /[code]?/saveAnswers` | `{ guestId, answers }` |
| `GET /admin` | список приглашений, срезы, счётчики |
| `POST /admin/...` | approve/reject seat_request, resend, merge duplicates |
| `POST /api/telegram/webhook/[secret]` | вебхук |
| `GET /api/health` | liveness для деплоя |

Все actions валидируют вход через Zod и проверяют, что `guestId` принадлежит invite из URL. Проверка владения — первая строка каждого action, не последняя.

Rate limit на `/[code]`: 60 запросов в минуту с IP. Перебор кодов бессмысленен при 10 символах base32, но лимит ставится.

---

## 11. UI-примитивы (`lib/ui`)

Собираются до фич, kitchen-sink на `/admin/kitchen-sink`. Базы нет, компоненты пишутся руками — их мало и дизайн авторский.

| компонент | пропсы (эскиз) |
|---|---|
| `Button` | `variant: 'solid'\|'ghost'\|'link'`, `size`, `loading`, `disabled` |
| `Input` / `Textarea` | `value`, `label`, `error`, `hint`, `required` |
| `Field` | обёртка label + error + hint |
| `RadioGroup` / `CheckboxGroup` | `options: {value,label}[]`, `value`, `name` |
| `Select` | тот же контракт, для длинных списков |
| `Card` | `padded`, `elevated` |
| `Badge` | `tone: 'neutral'\|'ok'\|'warn'\|'muted'` |
| `Modal` | `open`, `title`, `onClose`, focus-trap, `Esc` |
| `Toast` | `message`, `tone`, автоскрытие 4 s |
| `Accordion` | для FAQ, один открытый по умолчанию |
| `Stepper` | шаги RSVP-мастера, `steps`, `current` |
| `SeatMeter` | `seats`, `taken`, визуальный счётчик мест |
| `GuestCard` | `guest`, `onChange`, компактная карточка ответа |
| `Timeline` / `TimelineItem` | `time`, `title`, `note`, `mapUrl` |
| `Gallery` / `Lightbox` | `images`, свайп, `Esc`, предзагрузка соседних |
| `PaletteSwatch` | `colors: {hex,label}[]` для дресс-кода |
| `MapEmbed` | статичная карта-картинка + ссылка, без стороннего JS |
| `Countdown` | `target`, обновление раз в минуту, а не в секунду |
| `Reveal` | обёртка scroll-анимации, `delay`, `once` |
| `AdminTable` | `columns`, `rows`, сортировка, пустое состояние |

---

## 12. Дизайн и анимация

### Токены (`lib/styles/tokens.css`)

Направление: приглушённая зелень и тёплый камень, ботаническая графика, много воздуха. Не белый-с-терракотой.

```
--ink:        #23281F   текст
--sage-900:   #4A5C46   основной акцент
--sage-500:   #7C8F72
--sage-100:   #DCE3D5   фоновые плашки
--linen:      #F2EFE7   фон страницы
--clay:       #B9A48C   вторичный акцент, тонкие линии
```

Типографика: display — `Cormorant Garamond` (кириллица, 300/500), body — `Manrope` (400/600), utility (время в программе, лейблы) — `Manrope` с `font-feature-settings: 'tnum'`. Шрифты самохостятся, сабсет `cyrillic + latin`, `font-display: swap`, вариативные файлы.

Шкала: 1.250. Заголовки — крупные, разрядка `letter-spacing: 0.08em` только на надзаголовках капсом.

Сигнатурный элемент: вертикальная ботаническая линия-«стебель», которая прорастает по мере скролла вдоль программы дня (SVG `stroke-dashoffset`, привязанный к прогрессу секции). Один такой приём на весь сайт, остальное — тихо.

### Правила анимации

- Анимируются только `transform` и `opacity`. `width`, `height`, `top`, `filter` в анимациях запрещены.
- Появление: `translateY(16px) → 0`, `opacity 0 → 1`, 600 ms, `cubic-bezier(0.16, 1, 0.3, 1)`, stagger 80 ms, срабатывает один раз (`IntersectionObserver`, `unobserve` после срабатывания).
- Hero-изображение — LCP-элемент. Не анимируется на входе, не лениво грузится, `fetchpriority="high"`.
- `prefers-reduced-motion: reduce` → все reveal-анимации выключаются целиком, контент виден сразу. Проверяется e2e-тестом, а не глазами.
- Параллакс — максимум на двух блоках, амплитуда ≤ 24 px, отключается на мобильных и при reduced-motion.
- Без анимаций, задерживающих ввод: форма интерактивна сразу, кнопки не «прилетают».
- Скролл-джекинг, автоплей-звук, курсоры-кастомы — не используются.

### Копирайтинг интерфейса

Кнопка называет действие и сохраняет имя во всём потоке: «Подтвердить» → тост «Подтверждено». Ошибка говорит, что случилось и что делать. Пустое состояние в админке предлагает действие, а не сообщает о пустоте.

---

## 13. Стратегия тестов

Тесты привязаны к слайсу и PR. Слайс мёржится только с тестами.

Главная ловушка: сессия пишет код, потом пишет тесты, подтверждающие, что код делает то, что делает, вместе с багами. Поэтому правило: **тесты выводятся из критериев приёмки задачи, не из реализации**. Тест кодирует контракт, не зеркалит код.

Обязательные типы на слайс:

1. **Контрактные на стыках.** Payload джоба и колбэк-данные бота валидируются против zod-схем из `contracts.ts`. Фейковый Telegram-клиент — тестовый шов: падает, если слайс шлёт мусор.
2. **Идемпотентность джобов.** Каждый хендлер прогоняется дважды с одним payload, эффект ровно один: одна строка в `notifications`, один вызов фейка.
3. **Путь ошибки.** Фейк возвращает 429 и 500, бот заблокирован (403), Telegram таймаутит. Проверяется ретрай, пометка `isBlocked`, отсутствие дублей после ретрая.
4. **Property-based (fast-check)** на чистой логике: нормализация имён, расчёт `freeSeats`, расписание напоминаний. Инварианты: `freeSeats >= 0`; сумма подтверждённых гостей никогда не превышает `seats` без approved `seat_request`; нормализация идемпотентна.

Обязательные e2e (Playwright), они же критерии приёмки продукта:
- гость открывает ссылку, видит своё имя, подтверждает, добавляет спутника, заполняет анкету, перезагружает страницу — состояние сохранилось;
- гость друзей не видит блоков семьи в HTML (`page.content()` проверяется на отсутствие маркера);
- превышение мест создаёт `seat_request`, гость видит корректный текст, админ одобряет, счётчик меняется;
- `prefers-reduced-motion` — контент отрисован без ожидания анимаций;
- после `RSVP_LOCK_AT` форма read-only.

БД в тестах — эфемерный Postgres в Docker, миграции применяются перед прогоном. Моков БД нет.

---

## 14. Инфраструктура и владение

- **Миграции.** Генерятся из `schema.ts`, применяются шагом деплоя, в CI прогоняются на эфемерном Postgres. Руками не редактируются.
- **Сид-скрипт** `lib/server/db/seed.ts`: 8 приглашений, покрывающих все ветки — семья с 4 местами, друзья с `plusOnePolicy='named'` и одним свободным местом, VIP с `open`, приглашение с ребёнком, приглашение с висящим `seat_request`, приглашение с заблокированным чатом, пара с общим `partyId`, приглашение без Telegram. Фейки отдают те же данные.
- **Конфиг.** Единый модуль `lib/server/config.ts`, все переменные через Zod, приложение падает при старте, если чего-то нет.
- **Секреты.** Только в `.env` на VPS и в GitHub Secrets. В репозитории — `.env.example`.
- **Бэкапы.** `pg_dump` ежедневно, за две недели до даты — ежечасно, копия вне VPS. Проверка восстановления обязательна за месяц до свадьбы.

`.env.example`:
```
DATABASE_URL=postgres://wedding:wedding@localhost:5432/wedding
ORIGIN=https://example.ru
WEDDING_DATE=2027-06-12T15:00:00+03:00
RSVP_LOCK_AT=2027-06-09T23:59:00+03:00
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_CHAT_ID=
ADMIN_PASSWORD_HASH=
USE_FAKE_TELEGRAM=true
```

---

## 15. Конвенции кода и коммитов

- Язык кода, коммитов, PR и комментариев — английский. Интерфейс сайта — русский.
- Коммиты: Conventional Commits, `type(scope): summary`. `type ∈ feat|fix|test|refactor|chore|docs`. Summary в императиве, со строчной, без точки, до ~50 символов. Тело — только чтобы объяснить *почему*.
- Коммитить по ходу работы маленькими логическими коммитами, каждый по возможности проходит тайпчек. Не сваливать всё одним коммитом в конце.
- PR: заголовок с ID задачи, тело короткое — что делает слайс, какие контракты трогает, чем покрыт.
- Комментарии объясняют *почему*, а не пересказывают код. Закомментированный код не оставлять.
- TypeScript strict, `any` запрещён, включая тестовый код. Внешние данные проходят Zod.
- Серверный код не импортируется в клиентские компоненты. Проверяется правилом импортов в eslint.
- Активный залог и конкретика в прозе интерфейса и документации. Без филлеров и em-dash.

**Definition of Done одной задачи:** линт зелёный, `svelte-check` без ошибок, `build` проходит, миграции применяются на чистой БД, тесты по доктрине §13 написаны (из критериев приёмки; для каждого джоба — тест идемпотентности; на стыке — контрактный тест), задача привязана к коммиту.

---

## 16. Дорожная карта

**Стадия 0 — скелет.** Не начинать фичи, пока чек-лист не зелёный целиком:
- CI зелёный на тривиальном PR;
- layout, роут `/[code]`, гард по коду приглашения в `main`;
- UI-примитивы отрендерены в kitchen-sink;
- pg-boss гоняет демо-джоб из воркера;
- фейк Telegram отдаёт сид-данные;
- миграции проходят на эфемерном Postgres в CI;
- сквозная вертикаль `/[code]` → RSVP одного гостя → запись в БД задеплоена на VPS.

**Стадия 1 — контентный сайт.** Блоки hero, invitation, timeline, love story, dress code, venue, FAQ, contacts. Сегментация по категории на сервере. Обработка изображений, шрифты, перф-бюджет. Тесты: снапшот сегментации (друг не видит блоки семьи), Lighthouse-бюджет в CI.

**Стадия 2 — RSVP и места.** Мастер: статус → спутники → анкета. `freeSeats`, `seat_requests`, лок по дате, аудит-события. Тесты: property-based на местах, e2e полного прохода, e2e превышения лимита.

**Стадия 3 — админка.** Список приглашений, срезы (`pending`, без Telegram, с запросами мест), одобрение запросов, экран возможных дублей, генератор кодов и ссылок, экспорт CSV для ресторана и рассадки, счётчики по блюдам и трансферу.

**Стадия 4 — Telegram-бот.** Webhook, привязка по `/start <code>`, `/status`, инлайн-кнопки RSVP, `reminders.scan` + `reminders.send`, обработка блокировок, уведомления организатору. Тесты: идемпотентность всех хендлеров, путь ошибки на 429/500/403, контрактные тесты колбэков.

**Стадия 5 — полировка.** Сигнатурная анимация программы дня, галерея с лайтбоксом, reduced-motion, доступность (фокус, контраст, клавиатура), тексты, мобильные детали, 404 и состояния ошибок.

**Стадия 6 — боевая готовность.** Бэкапы и проверка восстановления, rate limit, мониторинг воркера и вебхука, «режим дня свадьбы» (страница сворачивается до программы и адреса), прогон полного сценария на копии данных за месяц до даты.
