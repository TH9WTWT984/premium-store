import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export const USER_SESSION_COOKIE = "atelier_session";
export const ADMIN_SESSION_COOKIE = "atelier_admin_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiry() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.userSession.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: sessionExpiry() },
  });
  const store = await cookies();
  store.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function createAdminSession(adminUserId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.adminSession.create({
    data: { adminUserId, tokenHash: hashToken(token), expiresAt: sessionExpiry() },
  });
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) await prisma.userSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: { include: { role: { include: { permissions: true } } } } },
  });

  if (!session || session.expiresAt <= new Date() || !session.adminUser.isActive) {
    if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.adminUser;
}

export async function destroyUserSession() {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;
  if (token) await prisma.userSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(USER_SESSION_COOKIE);
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(ADMIN_SESSION_COOKIE);
}

export function assertValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
