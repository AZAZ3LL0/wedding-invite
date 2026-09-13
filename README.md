# wedding-invite

Сайт-приглашение на свадьбу с закрытым доступом по личной ссылке, RSVP и Telegram-ботом.

Источник истины по стеку, схеме, контрактам и дорожной карте — [tech.md](tech.md). Правила работы в репозитории — [CLAUDE.md](CLAUDE.md).

## Запуск

```
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Приглашения из сида открываются по коду, например `/FAM4SEAT01`. Kitchen-sink с примитивами — `/admin/kitchen-sink`.

Воркер очереди запускается отдельным процессом:

```
pnpm worker
```

## Команды

| команда                 | что делает            |
| ----------------------- | --------------------- |
| `pnpm dev`              | приложение            |
| `pnpm worker`           | процесс pg-boss       |
| `pnpm check`            | svelte-check          |
| `pnpm lint`             | prettier + eslint     |
| `pnpm format`           | форматирование        |
| `pnpm test`             | unit-тесты            |
| `pnpm test:integration` | тесты против Postgres |
| `pnpm test:e2e`         | playwright            |
| `pnpm db:generate`      | миграции из схемы     |
| `pnpm db:migrate`       | применить миграции    |
| `pnpm db:seed`          | фикстуры              |
| `pnpm images`           | обработка изображений |
| `pnpm perf:budget`      | бюджет JS-бандла      |

## Деплой

VPS держит `docker compose` с сервисами `postgres`, `migrate`, `app`, `worker`, `caddy`. Workflow `Deploy` запускается после зелёного CI на `main` и требует секретов `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_DIR`, `PUBLIC_URL`, необязательного `VPS_PORT`.

### Первый запуск на сервере

```
git clone git@github.com:AZAZ3LL0/wedding-invite.git /srv/wedding-invite
cd /srv/wedding-invite
cp .env.example .env
```

В `.env` заполняются `DATABASE_URL`, `ORIGIN`, даты и секреты бота. Туда же дописываются переменные инфраструктуры, которых нет в прикладном конфиге:

```
SITE_DOMAIN=example.ru
POSTGRES_USER=wedding
POSTGRES_PASSWORD=<длинный пароль>
POSTGRES_DB=wedding
```

`DATABASE_URL` указывает на хост `postgres` внутри сети compose: `postgres://wedding:<пароль>@postgres:5432/wedding`. Дальше:

```
docker compose up -d --build
docker compose logs -f app worker
```

Миграции применяет сервис `migrate` до старта `app` и `worker`. Проверка живости — `https://<домен>/api/health`.

## Контент

Тексты сайта лежат в `src/lib/content` типизированными модулями, по файлу на блок. Правка контента — это git-дифф, не CRUD.

Сегментация по категории приглашения происходит на сервере, в `load` страницы гостя. Блок чужой аудитории не попадает в HTML вообще, поэтому CSS-скрытием пользоваться нельзя. Форма обращения (`ты` / `вы`) выбирается там же: пары `{ ty, vy }` схлопываются в строку до отправки клиенту.

Добавить блок: создать модуль в `src/lib/content`, включить его в `blocks.ts`, добавить ветку в `BlockRenderer.svelte` и строку в ожидаемый список `tests/unit/content-segmentation.test.ts`.

### Изображения

Исходники лежат в `assets/images` и не отдаются наружу. Производные (AVIF, WebP, JPEG в пяти ширинах) и манифест `src/lib/content/generated/images.ts` собираются заранее и коммитятся, поэтому `pnpm build` только компилирует:

```
pnpm images
```

Файлы в `assets/images` сейчас заглушки. Их заменяют настоящими фотографиями с теми же именами и перегоняют командой выше.

### Шрифты

Cormorant Garamond и Manrope самохостятся из `static/fonts`: вариативные woff2, сабсеты `cyrillic` и `latin` раздельно, `font-display: swap`. Кириллические файлы предзагружаются в `src/app.html`.

## Перф-бюджет

| что               | предел      | чем проверяется                       |
| ----------------- | ----------- | ------------------------------------- |
| JS страницы гостя | 130 KB gzip | `pnpm perf:budget` после `pnpm build` |
| LCP на 4G         | 2.0 s       | Lighthouse CI, `lighthouserc.json`    |
| CLS               | 0.05        | Lighthouse CI, `lighthouserc.json`    |

`pnpm perf:budget` считает gzip всего клиентского бандла из `.svelte-kit/output/client` и падает при превышении. Lighthouse гоняется в CI на двух приглашениях разных категорий, в три прогона, на мобильной эмуляции с медленным 4G.
