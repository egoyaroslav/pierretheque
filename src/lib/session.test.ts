import { describe, it, expect } from "vitest";
import { encryptSession, decryptSession } from "@/lib/session";

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
