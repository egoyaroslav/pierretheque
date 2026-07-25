# CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded product/brand/coming-soon data in `src/lib/products.ts` with a Turso (libSQL) database managed through a password-protected `/admin` panel, so the site owner can add and edit content without a developer.

**Architecture:** Next.js 16 Server Components + Server Actions read/write through a small Drizzle ORM data-access layer backed by Turso. A single shared password creates a signed JWT cookie session, checked optimistically in `proxy.ts` (this Next.js version's renamed `middleware.ts`) and again inside every mutating Server Action. Product images go through a `saveImage()` abstraction that writes to `public/uploads/` locally and switches to Vercel Blob the moment `BLOB_READ_WRITE_TOKEN` is set — no code change needed for that switch.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, TypeScript, Tailwind v4, Drizzle ORM + `@libsql/client` (Turso), `jose` (JWT session), Zod, `@vercel/blob`, Vitest (unit tests for non-UI logic).

## Global Constraints

- DB connection env vars are `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`. Local dev value: `TURSO_DATABASE_URL=file:./local.db` (already set in `.env.local`). Production value (set later, on the client PC): the real `libsql://...` URL + token — same variable names, no code change.
- Auth env vars: `ADMIN_PASSWORD` (plaintext compare, single shared password) and `SESSION_SECRET` (JWT signing key). Dev placeholders already in `.env.local`.
- Image storage env var: `BLOB_READ_WRITE_TOKEN`. Empty locally → filesystem fallback. Set later → Vercel Blob.
- This Next.js version renamed `middleware.ts` → `proxy.ts` (exported function name `proxy`, not `middleware`). Do not create a `middleware.ts` file.
- Route protection must be redundant: `proxy.ts` optimistic check AND a `verifySession()` call inside every Server Action that mutates data (per Next.js's own security guidance — Proxy alone is not sufficient).
- Reuse existing design tokens from `src/app/globals.css` (`bg-paper`, `text-ink`, `bg-charcoal`, `text-muted`, `border-line`, `font-display`, `.tracked`) for all new admin UI — no new color/font tokens.
- No new client-side state libraries. Server Actions + `useActionState`; a form needs `"use client"` only when it manages dynamically-added rows (product description paragraphs / detail pairs).

---

## File Structure Overview

```
drizzle.config.ts                          # drizzle-kit config (new)
vitest.config.ts                           # vitest config (new)
scripts/seed.ts                            # one-time data migration (new)
proxy.ts                                   # admin route protection (new)
src/lib/db/schema.ts                       # Drizzle table defs (new)
src/lib/db/client.ts                       # shared db instance (new)
src/lib/db/test-utils.ts                   # in-memory test db factory (new)
src/lib/data/products.ts                   # product CRUD (new, replaces src/lib/products.ts)
src/lib/data/brands.ts                     # brand CRUD (new)
src/lib/data/coming-soon.ts                # coming-soon CRUD (new)
src/lib/auth.ts                            # session create/verify/delete (new)
src/lib/storage.ts                         # saveImage() abstraction (new)
src/app/layout.tsx                         # trimmed to html/body/fonts only (modified)
src/app/(site)/layout.tsx                  # public chrome: cart/header/footer (new, moved out of root layout)
src/app/(site)/page.tsx                    # moved from src/app/page.tsx
src/app/(site)/products/[slug]/page.tsx    # moved from src/app/products/[slug]/page.tsx
src/app/admin/layout.tsx                   # admin chrome + session gate for nested pages (new)
src/app/admin/login/page.tsx               # login form (new)
src/app/admin/login/actions.ts             # login Server Action (new)
src/app/admin/actions.ts                   # logout Server Action (new)
src/app/admin/products/page.tsx            # product list (new)
src/app/admin/products/actions.ts          # create/update/delete Server Actions (new)
src/app/admin/products/new/page.tsx        # create form (new)
src/app/admin/products/[id]/edit/page.tsx  # edit form (new)
src/components/admin/ProductForm.tsx       # shared client form (new)
src/app/admin/brands/page.tsx              # brand list/add/edit/delete (new)
src/app/admin/brands/actions.ts            # brand Server Actions (new)
src/app/admin/coming-soon/page.tsx         # coming-soon list/add/edit/delete (new)
src/app/admin/coming-soon/actions.ts       # coming-soon Server Actions (new)
src/components/Hero.tsx                    # async, reads brands from DB (modified)
src/components/NewArrivals.tsx             # async, reads products+comingSoon from DB (modified)
src/components/ProductCard.tsx             # Product type import updated (modified)
src/components/Brands.tsx                  # async, reads brands (name+note) from DB (modified)
src/lib/products.ts                        # deleted after migration
next.config.ts                             # add images.remotePatterns for Blob (modified)
package.json                               # new deps + scripts (modified)
.gitignore                                 # already updated (local.db, /public/uploads)
```

---

### Task 1: Dependencies and tooling config

**Files:**
- Modify: `package.json`
- Create: `drizzle.config.ts`
- Create: `vitest.config.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `npm run db:generate`, `npm run db:push`, `npm run db:seed`, `npm run test` scripts used by all later tasks.

- [ ] **Step 1: Install runtime and dev dependencies**

```bash
npm install drizzle-orm@^0.45.2 @libsql/client@^0.17.4 jose@^6.2.4 zod@^4.4.3 @vercel/blob@^2.6.1
npm install -D drizzle-kit@^0.31.10 vitest@^4.1.10 dotenv@^17.4.2 tsx@^4.23.1
```

- [ ] **Step 2: Add scripts to `package.json`**

Add these entries inside `"scripts"`:

```json
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push",
"db:seed": "tsx scripts/seed.ts",
"test": "vitest run"
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 5: Add Vercel Blob remote pattern to `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Verify tooling is wired up**

Run: `npx vitest run`
Expected: exits 0 with a "No test files found" message (no test files exist yet — this just confirms Vitest runs).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts vitest.config.ts next.config.ts
git commit -m "Add CMS dependencies and tooling config"
```

---

### Task 2: Split root layout into (site) and admin route groups

The root layout currently renders `CartProvider`, `AnnouncementBar`, `Header`, and `Footer` around every page — including the admin panel, which must not show the shop cart or announcement bar. Move the public chrome into a `(site)` route group; the root layout keeps only html/body/fonts.

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(site)/layout.tsx`
- Create: `src/app/(site)/page.tsx` (moved content)
- Delete: `src/app/page.tsx`
- Create: `src/app/(site)/products/[slug]/page.tsx` (moved content)
- Delete: `src/app/products/[slug]/page.tsx` (and the now-empty `src/app/products/[slug]/` and `src/app/products/` directories)

- [ ] **Step 1: Read the current `src/app/page.tsx` and `src/app/products/[slug]/page.tsx` content**

(Already known from repo exploration — copy their current content verbatim into the new locations in the next steps; do not change their logic in this task.)

- [ ] **Step 2: Rewrite `src/app/layout.tsx` to the minimal shell**

```tsx
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Instrument_Serif({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sansFont = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PIERRETHEQUE — Archive Japanese Designer Wear",
  description:
    "Curated archive Japanese designer wear — IF SIX WAS NINE, L.G.B., BEAUTIFUL:BEAST and more. Authenticated pieces, sold one at a time.",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create `src/app/(site)/layout.tsx` with the public chrome**

```tsx
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      {children}
      <Footer />
    </CartProvider>
  );
}
```

- [ ] **Step 4: Move the home page**

Move `src/app/page.tsx` to `src/app/(site)/page.tsx` with identical content (no logic change). Delete the old `src/app/page.tsx`.

- [ ] **Step 5: Move the product detail page**

Move `src/app/products/[slug]/page.tsx` to `src/app/(site)/products/[slug]/page.tsx` with identical content. Delete the old file and the now-empty `src/app/products/` directory.

- [ ] **Step 6: Verify routing still works**

Run: `npm run dev`
Visit `http://localhost:3000/` and `http://localhost:3000/products/ifsixwasnine-mudmax-gypsy` — both must render exactly as before (route groups don't change URLs). Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/app
git commit -m "Split root layout into (site) route group so /admin can have its own chrome"
```

---

### Task 3: Drizzle schema, DB client, and test-db helper

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/client.ts`
- Create: `src/lib/db/test-utils.ts`

**Interfaces:**
- Produces: `products`, `brands`, `comingSoon` table objects; `db` (default client instance); `createTestDb()` returning an in-memory Drizzle instance with matching tables, for use by data-layer tests in Tasks 4–6.

- [ ] **Step 1: Create `src/lib/db/schema.ts`**

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  size: text("size").notNull(),
  condition: text("condition").notNull(),
  origin: text("origin").notNull(),
  description: text("description", { mode: "json" }).$type<string[]>().notNull(),
  details: text("details", { mode: "json" })
    .$type<{ label: string; value: string }[]>()
    .notNull(),
  images: text("images", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  note: text("note"),
  position: integer("position").notNull().default(0),
});

export const comingSoon = sqliteTable("coming_soon", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brand: text("brand").notNull(),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
});
```

- [ ] **Step 2: Create `src/lib/db/client.ts`**

```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

- [ ] **Step 3: Create `src/lib/db/test-utils.ts`**

This mirrors the schema above as raw SQL so tests get a fresh in-memory database without needing the `drizzle-kit` CLI.

```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const CREATE_TABLES_SQL = [
  `CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    size TEXT NOT NULL,
    condition TEXT NOT NULL,
    origin TEXT NOT NULL,
    description TEXT NOT NULL,
    details TEXT NOT NULL,
    images TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    note TEXT,
    position INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE coming_soon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    label TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  )`,
];

export async function createTestDb() {
  const client = createClient({ url: ":memory:" });
  for (const statement of CREATE_TABLES_SQL) {
    await client.execute(statement);
  }
  return drizzle(client, { schema });
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/db/`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db
git commit -m "Add Drizzle schema, DB client, and test-db helper"
```

---

### Task 4: Products data layer

**Files:**
- Create: `src/lib/data/products.ts`
- Test: `src/lib/data/products.test.ts`

**Interfaces:**
- Consumes: `products` table and `Product`/insert types from `src/lib/db/schema.ts` (Task 3); `createTestDb()` from `src/lib/db/test-utils.ts` (Task 3).
- Produces: `type Product`, `type NewProduct = { slug, brand, name, price, size, condition, origin, description: string[], details: {label,value}[], images: string[] }`, `getProducts(dbClient?)`, `getProduct(slug, dbClient?)`, `getProductById(id, dbClient?)`, `createProduct(input: NewProduct, dbClient?)`, `updateProduct(id, input: Partial<NewProduct>, dbClient?)`, `deleteProduct(id, dbClient?)` — used by Task 11 (admin) and Task 14 (public site refactor).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/data/products.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "@/lib/db/test-utils";
import {
  getProducts,
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/data/products";

describe("products data layer", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  it("creates, reads, updates, and deletes a product", async () => {
    const created = await createProduct(
      {
        slug: "test-piece",
        brand: "TEST BRAND",
        name: "Test Piece",
        price: "Price on request",
        size: "M",
        condition: "Archive",
        origin: "Japan",
        description: ["First paragraph."],
        details: [{ label: "Fabric", value: "Cotton" }],
        images: ["/uploads/a.jpg"],
      },
      testDb
    );
    expect(created.id).toBeTypeOf("number");

    const all = await getProducts(testDb);
    expect(all).toHaveLength(1);

    const bySlug = await getProduct("test-piece", testDb);
    expect(bySlug?.name).toBe("Test Piece");

    const byId = await getProductById(created.id, testDb);
    expect(byId?.slug).toBe("test-piece");

    await updateProduct(created.id, { name: "Updated Piece" }, testDb);
    const updated = await getProductById(created.id, testDb);
    expect(updated?.name).toBe("Updated Piece");

    await deleteProduct(created.id, testDb);
    expect(await getProducts(testDb)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/data/products.test.ts`
Expected: FAIL — `src/lib/data/products.ts` does not exist yet.

- [ ] **Step 3: Implement `src/lib/data/products.ts`**

```ts
import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import { products } from "@/lib/db/schema";

type DbClient = typeof defaultDb;

export type Product = typeof products.$inferSelect;

export type NewProduct = {
  slug: string;
  brand: string;
  name: string;
  price: string;
  size: string;
  condition: string;
  origin: string;
  description: string[];
  details: { label: string; value: string }[];
  images: string[];
};

export async function getProducts(dbClient: DbClient = defaultDb) {
  return dbClient.select().from(products).orderBy(products.id);
}

export async function getProduct(slug: string, dbClient: DbClient = defaultDb) {
  const rows = await dbClient.select().from(products).where(eq(products.slug, slug));
  return rows[0];
}

export async function getProductById(id: number, dbClient: DbClient = defaultDb) {
  const rows = await dbClient.select().from(products).where(eq(products.id, id));
  return rows[0];
}

export async function createProduct(input: NewProduct, dbClient: DbClient = defaultDb) {
  const now = new Date();
  const [row] = await dbClient
    .insert(products)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateProduct(
  id: number,
  input: Partial<NewProduct>,
  dbClient: DbClient = defaultDb
) {
  const [row] = await dbClient
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return row;
}

export async function deleteProduct(id: number, dbClient: DbClient = defaultDb) {
  await dbClient.delete(products).where(eq(products.id, id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/data/products.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/products.ts src/lib/data/products.test.ts
git commit -m "Add products data layer with CRUD"
```

---

### Task 5: Brands data layer

**Files:**
- Create: `src/lib/data/brands.ts`
- Test: `src/lib/data/brands.test.ts`

**Interfaces:**
- Consumes: `brands` table (Task 3), `createTestDb()` (Task 3).
- Produces: `type Brand`, `type NewBrand = { name, note?: string | null, position: number }`, `getBrands(dbClient?)`, `createBrand(input: NewBrand, dbClient?)`, `updateBrand(id, input: Partial<NewBrand>, dbClient?)`, `deleteBrand(id, dbClient?)` — used by Task 12 (admin) and Task 14 (Hero/Brands refactor).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/data/brands.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "@/lib/db/test-utils";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/lib/data/brands";

describe("brands data layer", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  it("creates, lists, updates, and deletes a brand", async () => {
    const created = await createBrand(
      { name: "TEST LABEL", note: "A note.", position: 0 },
      testDb
    );
    expect(created.id).toBeTypeOf("number");

    expect(await getBrands(testDb)).toHaveLength(1);

    await updateBrand(created.id, { note: "Updated note." }, testDb);
    const [updated] = await getBrands(testDb);
    expect(updated.note).toBe("Updated note.");

    await deleteBrand(created.id, testDb);
    expect(await getBrands(testDb)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/data/brands.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/lib/data/brands.ts`**

```ts
import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import { brands } from "@/lib/db/schema";

type DbClient = typeof defaultDb;

export type Brand = typeof brands.$inferSelect;

export type NewBrand = {
  name: string;
  note?: string | null;
  position: number;
};

export async function getBrands(dbClient: DbClient = defaultDb) {
  return dbClient.select().from(brands).orderBy(brands.position);
}

export async function createBrand(input: NewBrand, dbClient: DbClient = defaultDb) {
  const [row] = await dbClient.insert(brands).values(input).returning();
  return row;
}

export async function updateBrand(
  id: number,
  input: Partial<NewBrand>,
  dbClient: DbClient = defaultDb
) {
  const [row] = await dbClient
    .update(brands)
    .set(input)
    .where(eq(brands.id, id))
    .returning();
  return row;
}

export async function deleteBrand(id: number, dbClient: DbClient = defaultDb) {
  await dbClient.delete(brands).where(eq(brands.id, id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/data/brands.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/brands.ts src/lib/data/brands.test.ts
git commit -m "Add brands data layer with CRUD"
```

---

### Task 6: Coming-soon data layer

**Files:**
- Create: `src/lib/data/coming-soon.ts`
- Test: `src/lib/data/coming-soon.test.ts`

**Interfaces:**
- Consumes: `comingSoon` table (Task 3), `createTestDb()` (Task 3).
- Produces: `type ComingSoonItem`, `type NewComingSoonItem = { brand, label, position: number }`, `getComingSoon(dbClient?)`, `createComingSoonItem(input, dbClient?)`, `updateComingSoonItem(id, input, dbClient?)`, `deleteComingSoonItem(id, dbClient?)` — used by Task 13 (admin) and Task 14 (NewArrivals/product page refactor).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/data/coming-soon.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "@/lib/db/test-utils";
import {
  getComingSoon,
  createComingSoonItem,
  updateComingSoonItem,
  deleteComingSoonItem,
} from "@/lib/data/coming-soon";

describe("coming-soon data layer", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeEach(async () => {
    testDb = await createTestDb();
  });

  it("creates, lists, updates, and deletes an entry", async () => {
    const created = await createComingSoonItem(
      { brand: "L.G.B.", label: "Leather & Outerwear", position: 0 },
      testDb
    );
    expect(created.id).toBeTypeOf("number");

    expect(await getComingSoon(testDb)).toHaveLength(1);

    await updateComingSoonItem(created.id, { label: "Updated label" }, testDb);
    const [updated] = await getComingSoon(testDb);
    expect(updated.label).toBe("Updated label");

    await deleteComingSoonItem(created.id, testDb);
    expect(await getComingSoon(testDb)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/data/coming-soon.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/lib/data/coming-soon.ts`**

```ts
import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import { comingSoon } from "@/lib/db/schema";

type DbClient = typeof defaultDb;

export type ComingSoonItem = typeof comingSoon.$inferSelect;

export type NewComingSoonItem = {
  brand: string;
  label: string;
  position: number;
};

export async function getComingSoon(dbClient: DbClient = defaultDb) {
  return dbClient.select().from(comingSoon).orderBy(comingSoon.position);
}

export async function createComingSoonItem(
  input: NewComingSoonItem,
  dbClient: DbClient = defaultDb
) {
  const [row] = await dbClient.insert(comingSoon).values(input).returning();
  return row;
}

export async function updateComingSoonItem(
  id: number,
  input: Partial<NewComingSoonItem>,
  dbClient: DbClient = defaultDb
) {
  const [row] = await dbClient
    .update(comingSoon)
    .set(input)
    .where(eq(comingSoon.id, id))
    .returning();
  return row;
}

export async function deleteComingSoonItem(id: number, dbClient: DbClient = defaultDb) {
  await dbClient.delete(comingSoon).where(eq(comingSoon.id, id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/data/coming-soon.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/coming-soon.ts src/lib/data/coming-soon.test.ts
git commit -m "Add coming-soon data layer with CRUD"
```

---

### Task 7: Push schema to local DB and seed existing data

**Files:**
- Create: `scripts/seed.ts`
- Generated: `drizzle/*.sql` (migration files, created by `db:generate`)

**Interfaces:**
- Consumes: `createProduct` (Task 4), `createBrand` (Task 5), `createComingSoonItem` (Task 6).

- [ ] **Step 1: Generate the migration**

Run: `npm run db:generate`
Expected: creates a `drizzle/0000_*.sql` file matching the schema from Task 3.

- [ ] **Step 2: Push schema to the local dev database**

Run: `npm run db:push`
Expected: creates `local.db` in the project root with the `products`, `brands`, `coming_soon` tables. Confirm with:

```bash
node -e "const {createClient}=require('@libsql/client');(async()=>{const c=createClient({url:'file:./local.db'});console.log((await c.execute(\"select name from sqlite_master where type='table'\")).rows)})()"
```

Expected output includes rows for `products`, `brands`, `coming_soon`.

- [ ] **Step 3: Write `scripts/seed.ts`**

Transfers the current hardcoded data from `src/lib/products.ts` into the database.

```ts
import { createProduct } from "@/lib/data/products";
import { createBrand } from "@/lib/data/brands";
import { createComingSoonItem } from "@/lib/data/coming-soon";

async function seed() {
  await createProduct({
    slug: "ifsixwasnine-mudmax-gypsy",
    brand: "IF SIX WAS NINE",
    name: "Mudmax Gypsy",
    price: "Price on request",
    images: [
      "/products/mudmax-gypsy/front.jpg",
      "/products/mudmax-gypsy/detail.jpg",
    ],
    size: "28",
    condition: "Archive — Pre-Owned",
    origin: "Japan",
    description: [
      "A one-of-one piece from IF SIX WAS NINE's mud-dyed “Gypsy” denim line — the label's signature hand-distressed silhouette, worked over with earth pigment, splatter patina and reinforced tear repairs until no two pairs read the same.",
      "The waist closes with a corset-style leather lace instead of a standard fly, cinching the hip and giving the cut its unmistakable, body-conscious drape. Below the knee, the original denim is cut away and replaced with a bonded black leather flare panel, raw-edged at the hem.",
      "Sourced directly from the archive, authenticated, and photographed unworn since acquisition. Sold as seen — the wear is the piece.",
    ],
    details: [
      { label: "Label", value: "IF SIX WAS NINE" },
      { label: "Fabric", value: "Cotton denim, bonded leather panel, leather lace" },
      { label: "Construction", value: "Hand-distressed, mud-dye patina, corset lacing" },
      { label: "Care", value: "Specialist dry clean only — do not machine wash" },
      { label: "Authenticity", value: "Verified archive piece, sold directly by PIERRETHEQUE" },
    ],
  });

  await createBrand({
    name: "IF SIX WAS NINE",
    note: "Mud-dyed denim, leather lacing and hand-distressed archive silhouettes.",
    position: 0,
  });
  await createBrand({
    name: "L.G.B.",
    note: "Worn-leather outerwear built for permanent, honest decay.",
    position: 1,
  });
  await createBrand({
    name: "BEAUTIFUL:BEAST",
    note: "Painterly cutsew and knitwear from Japan's underground.",
    position: 2,
  });

  await createComingSoonItem({ brand: "L.G.B.", label: "Leather & Outerwear", position: 0 });
  await createComingSoonItem({ brand: "BEAUTIFUL:BEAST", label: "Knitwear & Cutsew", position: 1 });
  await createComingSoonItem({ brand: "ARCHIVE", label: "Accessories", position: 2 });

  console.log("Seed complete.");
}

seed().then(() => process.exit(0));
```

- [ ] **Step 4: Run the seed script**

Run: `npm run db:seed`
Expected: prints "Seed complete." with no errors.

- [ ] **Step 5: Verify seeded data**

```bash
node -e "const {createClient}=require('@libsql/client');(async()=>{const c=createClient({url:'file:./local.db'});console.log(await c.execute('select count(*) as n from products'));console.log(await c.execute('select count(*) as n from brands'));console.log(await c.execute('select count(*) as n from coming_soon'))})()"
```

Expected: `products` = 1, `brands` = 3, `coming_soon` = 3.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed.ts drizzle
git commit -m "Add DB migration and seed script for existing product data"
```

---

### Task 8: Session auth library

**Files:**
- Create: `src/lib/auth.ts`
- Test: `src/lib/auth.test.ts`

**Interfaces:**
- Produces: `createSession(): Promise<void>` (sets cookie), `verifySession(): Promise<boolean>` (reads cookie from `next/headers`), `deleteSession(): Promise<void>`, plus pure `encryptSession(payload)`/`decryptSession(token)` helpers used directly by the test (cookie-based functions need a request context and are exercised manually in Task 10, not unit tested here). Used by Task 10 (login/logout/proxy) and Task 11–13 (Server Action guards).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/auth.test.ts
import { describe, it, expect } from "vitest";
import { encryptSession, decryptSession } from "@/lib/auth";

describe("session encryption", () => {
  it("round-trips a valid payload", async () => {
    const token = await encryptSession({ sub: "admin" });
    const payload = await decryptSession(token);
    expect(payload?.sub).toBe("admin");
  });

  it("rejects a tampered token", async () => {
    const token = await encryptSession({ sub: "admin" });
    const tampered = token.slice(0, -1) + (token.at(-1) === "a" ? "b" : "a");
    const payload = await decryptSession(tampered);
    expect(payload).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/auth.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/lib/auth.ts`**

```ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtVerify<{ sub: string }>(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return undefined;
  }
}

export async function createSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encryptSession({ sub: "admin" });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const payload = await decryptSession(token);
  return payload?.sub === "admin";
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts
git commit -m "Add JWT session auth library"
```

---

### Task 9: Image storage abstraction

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Produces: `saveImage(file: File): Promise<string>` — used by Task 11 (product form Server Action).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/storage.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rm } from "node:fs/promises";
import path from "node:path";

const ORIGINAL_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

describe("saveImage", () => {
  afterEach(async () => {
    process.env.BLOB_READ_WRITE_TOKEN = ORIGINAL_TOKEN;
    await rm(path.join(process.cwd(), "public", "uploads"), {
      recursive: true,
      force: true,
    });
    vi.resetModules();
  });

  it("saves to public/uploads when no Blob token is set", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const { saveImage } = await import("@/lib/storage");
    const file = new File(["fake-image-bytes"], "photo.jpg", { type: "image/jpeg" });

    const result = await saveImage(file);

    expect(result).toMatch(/^\/uploads\/.+\.jpg$/);
  });

  it("uploads via Vercel Blob when a token is set", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    vi.doMock("@vercel/blob", () => ({
      put: vi.fn().mockResolvedValue({ url: "https://example.public.blob.vercel-storage.com/photo.jpg" }),
    }));
    const { saveImage } = await import("@/lib/storage");
    const file = new File(["fake-image-bytes"], "photo.jpg", { type: "image/jpeg" });

    const result = await saveImage(file);

    expect(result).toBe("https://example.public.blob.vercel-storage.com/photo.jpg");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/lib/storage.ts`**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function saveImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "Add image storage abstraction (local filesystem / Vercel Blob)"
```

---

### Task 10: Route protection and login/logout

**Files:**
- Create: `proxy.ts` (project root, next to `next.config.ts`)
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/login/actions.ts`
- Create: `src/app/admin/actions.ts`

**Interfaces:**
- Consumes: `verifySession`, `createSession`, `deleteSession` from `src/lib/auth.ts` (Task 8).
- Produces: working `/admin/login` page and a `logoutAction` used by Task 11's admin layout.

- [ ] **Step 1: Create `proxy.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_session")?.value;
  const session = token ? await decryptSession(token) : undefined;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Create the login Server Action, `src/app/admin/login/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." };
  }

  await createSession();
  redirect("/admin/products");
}
```

- [ ] **Step 3: Create `src/app/admin/login/page.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper text-ink px-4">
      <form action={formAction} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display text-3xl mb-2">Admin Login</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="border border-line bg-transparent px-3 py-2 text-sm"
        />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Create the logout Server Action, `src/app/admin/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth";

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`
Visit `http://localhost:3000/admin/products` — expect a redirect to `/admin/login` (page doesn't exist yet, 404 is fine at `/admin/products` for now; confirm the *redirect* happens, e.g. via the Network tab).
Enter the value you set for `ADMIN_PASSWORD` in `.env.local` — expect redirect to `/admin/products` (404 until Task 11, but no redirect loop).
Enter a wrong password — expect the "Incorrect password." message, no redirect.
Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add proxy.ts src/app/admin
git commit -m "Add admin route protection and login/logout"
```

---

### Task 11: Admin products CRUD

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/actions.ts`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/components/admin/ProductForm.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct` (Task 4); `verifySession` (Task 8); `saveImage` (Task 9); `logout` (Task 10).

- [ ] **Step 1: Create the admin shell layout, `src/app/admin/layout.tsx`**

```tsx
import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <nav className="flex gap-6 text-[11px] tracked uppercase text-muted">
          <Link href="/admin/products" className="hover:text-ink">Products</Link>
          <Link href="/admin/brands" className="hover:text-ink">Brands</Link>
          <Link href="/admin/coming-soon" className="hover:text-ink">Coming Soon</Link>
        </nav>
        <form action={logout}>
          <button className="text-[11px] tracked uppercase text-muted hover:text-ink">
            Log Out
          </button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/products/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { saveImage } from "@/lib/storage";
import { createProduct, updateProduct, deleteProduct, type NewProduct } from "@/lib/data/products";

function readProductForm(formData: FormData): Omit<NewProduct, "images"> {
  return {
    slug: String(formData.get("slug")),
    brand: String(formData.get("brand")),
    name: String(formData.get("name")),
    price: String(formData.get("price")),
    size: String(formData.get("size")),
    condition: String(formData.get("condition")),
    origin: String(formData.get("origin")),
    description: formData.getAll("description").map(String).filter(Boolean),
    details: formData
      .getAll("detailLabel")
      .map((label, i) => ({
        label: String(label),
        value: String(formData.getAll("detailValue")[i] ?? ""),
      }))
      .filter((d) => d.label),
  };
}

export async function createProductAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(files.map(saveImage));

  await createProduct({ ...readProductForm(formData), images: uploadedUrls });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  const keptImages = formData.getAll("keptImages").map(String);
  const files = formData.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await Promise.all(files.map(saveImage));

  await updateProduct(id, {
    ...readProductForm(formData),
    images: [...keptImages, ...uploadedUrls],
  });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteProduct(id);
  revalidatePath("/admin/products");
}
```

- [ ] **Step 3: Create `src/app/admin/products/page.tsx`**

```tsx
import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { deleteProductAction } from "./actions";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors"
        >
          Add Product
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] tracked uppercase text-muted border-b border-line">
            <th className="text-left py-2">Brand</th>
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2">Slug</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-line-dark">
              <td className="py-3">{product.brand}</td>
              <td className="py-3">{product.name}</td>
              <td className="py-3 text-muted">{product.slug}</td>
              <td className="py-3 flex gap-4 justify-end">
                <Link href={`/admin/products/${product.id}/edit`} className="text-muted hover:text-ink">
                  Edit
                </Link>
                <form action={deleteProductAction.bind(null, product.id)}>
                  <button className="text-muted hover:text-ink">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create the shared client form, `src/components/admin/ProductForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";

export function ProductForm({
  product,
  action,
}: {
  product?: Product;
  action: (formData: FormData) => void;
}) {
  const [description, setDescription] = useState<string[]>(product?.description ?? [""]);
  const [details, setDetails] = useState<{ label: string; value: string }[]>(
    product?.details ?? [{ label: "", value: "" }]
  );
  const [keptImages, setKeptImages] = useState<string[]>(product?.images ?? []);

  return (
    <form action={action} className="flex flex-col gap-6 max-w-2xl">
      <label className="flex flex-col gap-1 text-sm">
        Slug
        <input name="slug" defaultValue={product?.slug} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Brand
        <input name="brand" defaultValue={product?.brand} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" defaultValue={product?.name} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Price
        <input name="price" defaultValue={product?.price} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Size
        <input name="size" defaultValue={product?.size} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Condition
        <input name="condition" defaultValue={product?.condition} required className="border border-line bg-transparent px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Origin
        <input name="origin" defaultValue={product?.origin} required className="border border-line bg-transparent px-3 py-2" />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Description</legend>
        {description.map((para, i) => (
          <textarea
            key={i}
            name="description"
            value={para}
            onChange={(e) => {
              const next = [...description];
              next[i] = e.target.value;
              setDescription(next);
            }}
            className="border border-line bg-transparent px-3 py-2 text-sm"
          />
        ))}
        <button type="button" onClick={() => setDescription([...description, ""])} className="text-[11px] tracked uppercase text-muted hover:text-ink self-start">
          + Add Paragraph
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Details</legend>
        {details.map((d, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="detailLabel"
              value={d.label}
              placeholder="Label"
              onChange={(e) => {
                const next = [...details];
                next[i] = { ...next[i], label: e.target.value };
                setDetails(next);
              }}
              className="border border-line bg-transparent px-3 py-2 text-sm w-1/3"
            />
            <input
              name="detailValue"
              value={d.value}
              placeholder="Value"
              onChange={(e) => {
                const next = [...details];
                next[i] = { ...next[i], value: e.target.value };
                setDetails(next);
              }}
              className="border border-line bg-transparent px-3 py-2 text-sm flex-1"
            />
          </div>
        ))}
        <button type="button" onClick={() => setDetails([...details, { label: "", value: "" }])} className="text-[11px] tracked uppercase text-muted hover:text-ink self-start">
          + Add Detail
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-[11px] tracked uppercase text-muted mb-2">Images</legend>
        {keptImages.map((url) => (
          <label key={url} className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="keptImages"
              value={url}
              defaultChecked
              onChange={(e) => {
                if (!e.target.checked) setKeptImages(keptImages.filter((u) => u !== url));
              }}
            />
            {url}
          </label>
        ))}
        <input type="file" name="newImages" multiple accept="image/*" className="text-sm" />
      </fieldset>

      <button
        type="submit"
        className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors self-start"
      >
        Save
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Create `src/app/admin/products/new/page.tsx`**

```tsx
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Add Product</h1>
      <ProductForm action={createProductAction} />
    </div>
  );
}
```

- [ ] **Step 6: Create `src/app/admin/products/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Edit Product</h1>
      <ProductForm product={product} action={updateProductAction.bind(null, product.id)} />
    </div>
  );
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, log in at `/admin/login`.
- Visit `/admin/products` — the seeded "Mudmax Gypsy" row appears.
- Click "Add Product", fill in all fields plus one image, submit — new row appears in the list.
- Click "Edit" on it, change the name, uncheck the image, upload a new one, submit — list reflects the new name; visit the file directly to confirm the old image checkbox removal worked (image array updated).
- Click "Delete" — row disappears.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin src/components/admin
git commit -m "Add admin products CRUD UI"
```

---

### Task 12: Admin brands page

**Files:**
- Create: `src/app/admin/brands/page.tsx`
- Create: `src/app/admin/brands/actions.ts`

**Interfaces:**
- Consumes: `getBrands`, `createBrand`, `updateBrand`, `deleteBrand` (Task 5); `verifySession` (Task 8).

- [ ] **Step 1: Create `src/app/admin/brands/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { createBrand, updateBrand, deleteBrand } from "@/lib/data/brands";

export async function createBrandAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await createBrand({
    name: String(formData.get("name")),
    note: String(formData.get("note") || "") || null,
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/brands");
}

export async function updateBrandAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await updateBrand(id, {
    name: String(formData.get("name")),
    note: String(formData.get("note") || "") || null,
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/brands");
}

export async function deleteBrandAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteBrand(id);
  revalidatePath("/admin/brands");
}
```

- [ ] **Step 2: Create `src/app/admin/brands/page.tsx`**

```tsx
import { getBrands } from "@/lib/data/brands";
import { createBrandAction, updateBrandAction, deleteBrandAction } from "./actions";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-display text-3xl">Brands</h1>

      <div className="flex flex-col gap-6">
        {brands.map((brand) => (
          <form
            key={brand.id}
            action={updateBrandAction.bind(null, brand.id)}
            className="flex flex-col gap-2 border-b border-line-dark pb-4"
          >
            <input name="name" defaultValue={brand.name} className="border border-line bg-transparent px-3 py-2 text-sm" />
            <textarea name="note" defaultValue={brand.note ?? ""} className="border border-line bg-transparent px-3 py-2 text-sm" />
            <div className="flex items-center gap-3">
              <input name="position" type="number" defaultValue={brand.position} className="border border-line bg-transparent px-3 py-2 text-sm w-20" />
              <button type="submit" className="text-[11px] tracked uppercase text-muted hover:text-ink">
                Save
              </button>
              <button formAction={deleteBrandAction.bind(null, brand.id)} className="text-[11px] tracked uppercase text-muted hover:text-ink">
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>

      <form action={createBrandAction} className="flex flex-col gap-2">
        <h2 className="text-[11px] tracked uppercase text-muted">Add Brand</h2>
        <input name="name" placeholder="Name" required className="border border-line bg-transparent px-3 py-2 text-sm" />
        <textarea name="note" placeholder="Note" className="border border-line bg-transparent px-3 py-2 text-sm" />
        <input name="position" type="number" placeholder="Position" defaultValue={0} className="border border-line bg-transparent px-3 py-2 text-sm w-20" />
        <button type="submit" className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors self-start">
          Add
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Log in, visit `/admin/brands`. Edit a brand's note and save — text persists after reload. Add a new brand — appears in the list. Delete it — disappears.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/brands
git commit -m "Add admin brands CRUD UI"
```

---

### Task 13: Admin coming-soon page

**Files:**
- Create: `src/app/admin/coming-soon/page.tsx`
- Create: `src/app/admin/coming-soon/actions.ts`

**Interfaces:**
- Consumes: `getComingSoon`, `createComingSoonItem`, `updateComingSoonItem`, `deleteComingSoonItem` (Task 6); `verifySession` (Task 8).

- [ ] **Step 1: Create `src/app/admin/coming-soon/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { createComingSoonItem, updateComingSoonItem, deleteComingSoonItem } from "@/lib/data/coming-soon";

export async function createComingSoonAction(formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await createComingSoonItem({
    brand: String(formData.get("brand")),
    label: String(formData.get("label")),
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/coming-soon");
}

export async function updateComingSoonAction(id: number, formData: FormData) {
  if (!(await verifySession())) redirect("/admin/login");

  await updateComingSoonItem(id, {
    brand: String(formData.get("brand")),
    label: String(formData.get("label")),
    position: Number(formData.get("position") || 0),
  });
  revalidatePath("/admin/coming-soon");
}

export async function deleteComingSoonAction(id: number) {
  if (!(await verifySession())) redirect("/admin/login");

  await deleteComingSoonItem(id);
  revalidatePath("/admin/coming-soon");
}
```

- [ ] **Step 2: Create `src/app/admin/coming-soon/page.tsx`**

```tsx
import { getComingSoon } from "@/lib/data/coming-soon";
import { createComingSoonAction, updateComingSoonAction, deleteComingSoonAction } from "./actions";

export default async function AdminComingSoonPage() {
  const items = await getComingSoon();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="font-display text-3xl">Coming Soon</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <form
            key={item.id}
            action={updateComingSoonAction.bind(null, item.id)}
            className="flex items-center gap-2 border-b border-line-dark pb-3"
          >
            <input name="brand" defaultValue={item.brand} className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
            <input name="label" defaultValue={item.label} className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
            <input name="position" type="number" defaultValue={item.position} className="border border-line bg-transparent px-3 py-2 text-sm w-16" />
            <button type="submit" className="text-[11px] tracked uppercase text-muted hover:text-ink">
              Save
            </button>
            <button formAction={deleteComingSoonAction.bind(null, item.id)} className="text-[11px] tracked uppercase text-muted hover:text-ink">
              Delete
            </button>
          </form>
        ))}
      </div>

      <form action={createComingSoonAction} className="flex items-center gap-2">
        <input name="brand" placeholder="Brand" required className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
        <input name="label" placeholder="Label" required className="border border-line bg-transparent px-3 py-2 text-sm flex-1" />
        <input name="position" type="number" placeholder="Position" defaultValue={0} className="border border-line bg-transparent px-3 py-2 text-sm w-16" />
        <button type="submit" className="border border-line px-3 py-2 text-[11px] tracked uppercase hover:bg-ink hover:text-paper transition-colors">
          Add
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

Log in, visit `/admin/coming-soon`. Edit an entry's label and save — persists after reload. Add and delete an entry.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/coming-soon
git commit -m "Add admin coming-soon CRUD UI"
```

---

### Task 14: Refactor public site to read from the database

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/NewArrivals.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/Brands.tsx`
- Modify: `src/app/(site)/products/[slug]/page.tsx`
- Delete: `src/lib/products.ts`

**Interfaces:**
- Consumes: `getProducts`, `getProduct` (Task 4), `getBrands` (Task 5), `getComingSoon` (Task 6).

- [ ] **Step 1: Update `src/components/ProductCard.tsx` to use the new `Product` type**

Change the import line from:

```tsx
import type { Product } from "@/lib/products";
```

to:

```tsx
import type { Product } from "@/lib/data/products";
```

No other changes needed — the shape returned by Drizzle matches the old `Product` type's fields.

- [ ] **Step 2: Make `Hero.tsx` async and read brands from the DB**

Change:

```tsx
import { brands } from "@/lib/products";

export function Hero() {
```

to:

```tsx
import { getBrands } from "@/lib/data/brands";

export async function Hero() {
  const brands = await getBrands();
```

And change the render loop from `{brands.map((b) => (<span key={b}>{b}</span>))}` to `{brands.map((b) => (<span key={b.id}>{b.name}</span>))}`.

- [ ] **Step 3: Make `NewArrivals.tsx` async and read from the DB**

```tsx
import { getProducts } from "@/lib/data/products";
import { getComingSoon } from "@/lib/data/coming-soon";
import { ProductCard } from "@/components/ProductCard";
import { PlaceholderCard } from "@/components/PlaceholderCard";
import { AmbientGlow } from "@/components/AmbientGlow";

export async function NewArrivals() {
  const [products, comingSoon] = await Promise.all([getProducts(), getComingSoon()]);

  return (
    <section id="new-arrivals" className="relative overflow-hidden scroll-mt-20">
      <AmbientGlow />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="text-[11px] tracked uppercase text-muted mb-2">
              One Piece At A Time
            </p>
            <h2 className="font-display text-4xl sm:text-5xl">
              New Arrivals
            </h2>
          </div>
          <a
            href="https://www.instagram.com/pierretheque/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-[11px] tracked uppercase text-ink/70 hover:text-ink transition-colors"
          >
            View All ↗
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
          {comingSoon.map((item) => (
            <PlaceholderCard key={item.id} brand={item.brand} label={item.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update `src/components/Brands.tsx` to read from the DB**

```tsx
import { AmbientGlow } from "@/components/AmbientGlow";
import { getBrands } from "@/lib/data/brands";

export async function Brands() {
  const brands = await getBrands();

  return (
    <section
      id="brands"
      className="relative overflow-hidden scroll-mt-20 bg-charcoal text-white"
    >
      <AmbientGlow />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-16 sm:py-24">
        <p className="text-[11px] tracked uppercase text-white/45 mb-2">
          Labels We Carry
        </p>
        <h2 className="font-display text-4xl sm:text-5xl mb-12 sm:mb-16">
          The Brands
        </h2>

        <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
          {brands.map((brand, i) => (
            <div
              key={brand.id}
              className="border-t border-line-dark pt-6 flex flex-col gap-3"
            >
              <span className="text-[10px] tracked text-white/35">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl">
                {brand.name}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-[36ch]">
                {brand.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Update `src/app/(site)/products/[slug]/page.tsx`**

Change the import and the two call sites:

```tsx
import { getProduct, getProducts } from "@/lib/data/products";
import { getComingSoon } from "@/lib/data/coming-soon";
```

```tsx
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const comingSoon = await getComingSoon();
```

Everything else in the file (JSX) stays the same — `product` and `comingSoon` keep the same shape.

- [ ] **Step 6: Delete `src/lib/products.ts`**

- [ ] **Step 7: Manual verification**

Run: `npm run dev`. Visit `/` — Hero brand list, New Arrivals grid, and Brands section all render from the seeded DB data. Visit the product detail page — same data as before. Edit the seeded product's name in `/admin/products`, reload `/` — new name appears.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.tsx src/components/NewArrivals.tsx src/components/ProductCard.tsx src/components/Brands.tsx "src/app/(site)/products/[slug]/page.tsx"
git rm src/lib/products.ts
git commit -m "Refactor public site to read products/brands/coming-soon from the database"
```

---

### Task 15: Visual polish

Both the admin panel and the public site get a polish pass. Reuse `src/app/globals.css` tokens (`bg-paper`, `bg-charcoal`, `text-ink`, `text-muted`, `border-line`, `font-display`, `.tracked`) — introduced already in Tasks 10–13 for the admin's base look. This task is the deliberate design-quality pass on top of that: use the `frontend-design` and/or `better-ui` skills while iterating, and use the `run` skill to view the site live in a browser rather than judging from code alone (visual quality is not something a diff can verify).

**Files:**
- Modify: `src/app/admin/layout.tsx`, `src/app/admin/products/page.tsx`, `src/components/admin/ProductForm.tsx`, `src/app/admin/brands/page.tsx`, `src/app/admin/coming-soon/page.tsx`, `src/app/admin/login/page.tsx` (admin polish — hover states, spacing rhythm, table styling, empty states)
- Modify: any of `src/components/Hero.tsx`, `src/components/NewArrivals.tsx`, `src/components/Brands.tsx`, `src/components/ProductCard.tsx` (public site polish, within the existing black-and-white concept — no new colors or layout concepts)

- [ ] **Step 1: Invoke the `frontend-design` skill (and `better-ui` if it offers additional relevant checks) before making changes**

- [ ] **Step 2: Use the `run` skill to launch the dev server and view `/`, `/admin/login`, `/admin/products`, `/admin/products/new`, `/admin/brands`, `/admin/coming-soon` in a browser**

- [ ] **Step 3: Apply polish to the admin UI**

Concrete targets: consistent focus/hover states on inputs and buttons (reuse the existing `hover:bg-ink hover:text-paper transition-colors` pattern already used on primary buttons), an empty-state message when a list has zero rows (e.g. "No products yet." in the same `text-muted` style as elsewhere), and consistent vertical rhythm between the admin nav, page heading, and content (match the `gap-6`/`gap-8` scale already used across pages).

- [ ] **Step 4: Apply polish to the public site**

Small, targeted improvements only — no new sections, no new colors. Judge against the live browser view from Step 2.

- [ ] **Step 5: Manual verification**

Click through every page listed in Step 2 again after changes. Confirm no layout regressions (compare against a screenshot taken before this task, if the `run` skill supports capturing one).

- [ ] **Step 6: Commit**

```bash
git add src/app/admin src/components
git commit -m "Visual polish pass on admin panel and public site"
```

---

### Task 16: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests from Tasks 4–9 pass.

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds (this exercises `generateStaticParams` against the real local DB).

- [ ] **Step 4: Full manual walkthrough**

Start `npm run dev` and, in order: log into `/admin`, add a new brand, add a new coming-soon entry, add a new product with two images, verify all three show up correctly on `/`, edit each one, verify changes reflect on `/`, delete each one, verify they disappear from `/`. Log out and confirm `/admin/products` redirects to `/admin/login`.

- [ ] **Step 5: Commit any final fixes found during verification, if any**

```bash
git add -A
git commit -m "Fix issues found during final CMS verification pass"
```
