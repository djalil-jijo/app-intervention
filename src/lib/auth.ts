import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

function getSecretKey(): string {
  return process.env.SESSION_SECRET || 'fallback-it-tasker-secret-key-2026';
}

export function signToken(payload: string): string {
  const secret = getSecretKey();
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = signToken(timestamp);
  return `${timestamp}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Check expiration (24h)
  const ageInSeconds = (Date.now() - timestamp) / 1000;
  if (ageInSeconds > SESSION_DURATION || ageInSeconds < 0) return false;

  // Verify HMAC signature
  const expectedSignature = signToken(timestampStr);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function setAdminSessionCookie() {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
