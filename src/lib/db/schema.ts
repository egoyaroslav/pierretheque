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
