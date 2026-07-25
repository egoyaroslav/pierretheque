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
