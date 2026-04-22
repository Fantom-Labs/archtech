import * as jose from "jose";

const ALG = "HS256";

export interface PortalJwtPayload {
  projectId: string;
  projectSlug: string;
  workspaceId: string;
  linkId: string;
}

export async function signPortalToken(
  payload: PortalJwtPayload,
  secret: string,
  expiresIn = "30d",
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyPortalToken(
  token: string,
  secret: string,
): Promise<PortalJwtPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, key);
  const projectId = String(payload.projectId ?? "");
  const projectSlug = String(payload.projectSlug ?? "");
  const workspaceId = String(payload.workspaceId ?? "");
  const linkId = String(payload.linkId ?? "");
  if (!projectId || !projectSlug || !workspaceId || !linkId) {
    throw new Error("Payload JWT inválido");
  }
  return { projectId, projectSlug, workspaceId, linkId };
}
