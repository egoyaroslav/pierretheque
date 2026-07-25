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
