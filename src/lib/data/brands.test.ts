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
