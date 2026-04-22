import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const IV_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.DRIVE_TOKEN_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("Defina DRIVE_TOKEN_ENCRYPTION_KEY (mín. 16 caracteres)");
  }
  return scryptSync(raw, "arqtech-drive-salt", 32);
}

export function encryptToken(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptToken(payload: string): string {
  const key = getKey();
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + 16);
  const data = buf.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
