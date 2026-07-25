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
