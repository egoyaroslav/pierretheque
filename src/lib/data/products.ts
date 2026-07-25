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
