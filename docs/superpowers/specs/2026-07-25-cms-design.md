# CMS для PIERRETHEQUE — дизайн

Дата: 2026-07-25

## Контекст

Сейчас данные о товарах, брендах и разделе "скоро в продаже" захардкожены в `src/lib/products.ts` и используются в 4 местах: `Hero`, `NewArrivals`, `ProductCard`, `src/app/products/[slug]/page.tsx`. Нужна админ-панель, чтобы владелец сайта мог сам добавлять/редактировать/удалять эти сущности без участия разработчика.

Технический контекст: проект на Next.js 16.2.10 (App Router), React 19. Это нестандартная версия Next.js — `middleware.ts` в ней переименован и заменён на `proxy.ts` с немного другим API (см. `node_modules/next/dist/docs/01-app/02-guides/authentication.md`). Дизайн ниже это учитывает.

## Хостинг и деплой

- Сайт хостится на **Vercel**, подключённом к GitHub-репозиторию `github.com/egoyaroslav/pierretheque`.
- База данных — **Turso** (libSQL), уже создана владельцем сайта отдельно от Vercel; независима от хостинг-провайдера.
- Разработка идёт на этом ПК через Claude Code. Реальное подключение к Vercel и заполнение продакшен-секретов произойдёт позже, на другом ПК ("клиентском"), когда сайт будет готов к запуску.
- Локально во время разработки используется **тот же env-контракт** (`.env.local`), что и в проде, но со значениями-заглушками:
  - `TURSO_DATABASE_URL=file:./local.db` (локальный SQLite-файл через libSQL-драйвер) — на клиентском ПК заменяется на реальный `libsql://...` URL, без изменений в коде.
  - `TURSO_AUTH_TOKEN` — пусто локально, реальный токен на клиентском ПК.
  - `ADMIN_PASSWORD`, `SESSION_SECRET` — dev-заглушки локально, реальные секреты на клиентском ПК.
  - `BLOB_READ_WRITE_TOKEN` — пусто локально (см. "Хранение изображений" ниже).

## Данные (Drizzle ORM + Turso/libSQL)

Три таблицы, определённые в `src/lib/db/schema.ts`:

- **products**: `id` (integer, PK autoincrement), `slug` (text, unique), `brand`, `name`, `price`, `size`, `condition`, `origin` (text), `description` (text, JSON-массив строк), `details` (text, JSON-массив `{label, value}`), `images` (text, JSON-массив URL/путей), `createdAt`, `updatedAt`.
- **brands**: `id`, `name` (text, unique).
- **comingSoon**: `id`, `brand`, `label`, `position` (integer, для сортировки).

`description`, `details`, `images` хранятся как JSON-текст (через `text({mode: 'json'})` в Drizzle) — отдельные таблицы под них избыточны для этого объёма данных.

Слой доступа к данным в `src/lib/data/products.ts` (заменяет текущий `src/lib/products.ts`) экспортирует асинхронные функции: `getProducts()`, `getProduct(slug)`, `getBrands()`, `getComingSoon()`, плюс мутации `createProduct()`, `updateProduct()`, `deleteProduct()` и аналогичные для brands/comingSoon — используются только из Server Actions админки.

Разовый скрипт `scripts/seed.ts` переносит текущие захардкоженные данные (1 товар, 3 бренда, 3 comingSoon-записи) в базу.

## Аутентификация админки

- Один общий пароль из `ADMIN_PASSWORD` (env). Без таблицы пользователей — сверка пароля со значением из env в Server Action логина.
- Сессия — подписанный JWT в httpOnly-cookie (библиотека `jose`), секрет — `SESSION_SECRET`, срок жизни 7 дней.
- `src/lib/auth.ts` — DAL с функциями `createSession()`, `verifySession()`, `deleteSession()` (паттерн из офиц. гайда Next.js по аутентификации).
- `proxy.ts` в корне проекта (не `middleware.ts` — в этой версии Next.js файл называется иначе) — оптимистично редиректит с `/admin/*` на `/admin/login`, если валидной cookie нет.
- Каждый Server Action, изменяющий данные в админке, дополнительно сам вызывает `verifySession()` — это официальная рекомендация Next.js (Server Actions нужно защищать так же, как публичные API-эндпоинты, проверка в proxy — только первый рубеж).

## Хранение изображений

`src/lib/storage.ts` экспортирует `saveImage(file: File): Promise<string>`:
- если задан `BLOB_READ_WRITE_TOKEN` — загружает через `@vercel/blob` (`put()`) и возвращает публичный URL;
- если токена нет — сохраняет файл в `public/uploads/` и возвращает локальный путь.

Вызывающий код (Server Action формы товара) не знает, какая ветка сработала — переключение происходит только через наличие переменной окружения, без изменений в коде при подключении Vercel Blob позже.

## Admin UI

- `/admin/login` — форма пароля.
- `/admin/products` — таблица товаров, кнопка "добавить".
- `/admin/products/new` и `/admin/products/[id]/edit` — форма: основные поля, загрузка нескольких изображений, динамически добавляемые абзацы описания и пары характеристик (label/value).
- `/admin/brands` — список брендов, добавление/удаление.
- `/admin/coming-soon` — список записей "скоро в продаже", добавление/редактирование/удаление, с сортировкой по `position`.
- Всё на серверных формах (`<form action={serverAction}>` + `useActionState`), без клиентских стейт-менеджеров.

## Публичная часть сайта

`Hero`, `NewArrivals`, `ProductCard`, `src/app/products/[slug]/page.tsx` переводятся на асинхронные server components, читающие данные через `src/lib/data/products.ts` вместо статических импортов из `src/lib/products.ts`. Старый `src/lib/products.ts` удаляется после переноса данных.

## Тестирование перед готовностью

Локально: `npm run dev` с `file:./local.db`, вручную пройти CRUD по всем трём сущностям через `/admin`, убедиться, что изменения отражаются на публичных страницах.

## Вне рамок первой версии

- Несколько админ-пользователей / роли.
- Медиа-CDN/оптимизация изображений сверх стандартного `next/image`.
- Управление содержимым `About`/`Header`/`Footer` через CMS — эти компоненты остаются статичными.
