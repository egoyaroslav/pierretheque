import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptSession(token: string) {
  try {
    const { payload } = await jwtVerify<{ sub: string }>(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return undefined;
  }
}
