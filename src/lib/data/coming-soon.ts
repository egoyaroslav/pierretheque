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
