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
