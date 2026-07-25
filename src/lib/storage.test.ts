import { describe, it, expect, vi, afterEach } from "vitest";
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
    vi.doUnmock("@vercel/blob");
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
