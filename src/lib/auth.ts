import { cookies } from 'next/headers';
import crypto from 'crypto';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN_LEAD' | 'TECHNICIAN' | 'EMPLOYEE' | 'VIEWER';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  service?: string;
  unitType?: string;
  unitName?: string;
  functionTitle?: string;
  speciality?: string;
  phone?: string;
  signature?: string | null;
  stamp?: string | null;
  technicianId?: string;
  employeeId?: string;
}

const COOKIE_NAME = 'it_tasker_session';
const ADMIN_LEGACY_COOKIE = 'admin_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return process.env.SESSION_SECRET || 'fallback-it-tasker-secret-key-2026';
}

export function signToken(payload: string): string {
  const secret = getSecretKey();
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createTokenForUser(user: SessionUser): string {
  const payloadB64 = Buffer.from(JSON.stringify(user)).toString('base64url');
  const timestamp = Date.now().toString();
  const signature = signToken(`${payloadB64}.${timestamp}`);
  return `${payloadB64}.${timestamp}.${signature}`;
}

export function createLegacyAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = signToken(timestamp);
  return `${timestamp}.${signature}`;
}

export function verifyUserToken(token: string | undefined): SessionUser | null {
  if (!token) return null;

  const parts = token.split('.');
  
  // New 3-part token: [payloadB64, timestamp, signature]
  if (parts.length === 3) {
    const [payloadB64, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    const ageInSeconds = (Date.now() - timestamp) / 1000;
    if (ageInSeconds > SESSION_DURATION || ageInSeconds < 0) return null;

    const expectedSignature = signToken(`${payloadB64}.${timestampStr}`);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) return null;

    try {
      const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      return JSON.parse(jsonStr) as SessionUser;
    } catch {
      return null;
    }
  }

  // Legacy 2-part token: [timestamp, signature]
  if (parts.length === 2) {
    const [timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    const ageInSeconds = (Date.now() - timestamp) / 1000;
    if (ageInSeconds > 60 * 60 * 24 || ageInSeconds < 0) return null;

    const expectedSignature = signToken(timestampStr);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) return null;

    return {
      id: 'super-admin-legacy',
      name: 'Administrateur Principal',
      email: 'admin@enterprise.com',
      username: 'admin',
      role: 'SUPER_ADMIN',
    };
  }

  return null;
}

export async function setSessionCookie(user: SessionUser) {
  const token = createTokenForUser(user);
  const cookieStore = await cookies();
  
  // Set main unified cookie
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  // Also set legacy admin cookie if user has admin/technician access
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'TECHNICIAN' || user.role === 'TECHNICIAN_LEAD') {
    const legacyToken = createLegacyAdminToken();
    cookieStore.set(ADMIN_LEGACY_COOKIE, legacyToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    });
  }
}

export async function setAdminSessionCookie() {
  const user: SessionUser = {
    id: 'super-admin',
    name: 'Administrateur Principal',
    email: process.env.ADMIN_EMAIL || 'admin@enterprise.com',
    username: 'admin',
    role: 'SUPER_ADMIN',
  };
  await setSessionCookie(user);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(ADMIN_LEGACY_COOKIE);
}

export async function clearAdminSessionCookie() {
  await clearSessionCookie();
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(ADMIN_LEGACY_COOKIE)?.value;
  return verifyUserToken(token);
}

export async function getAdminSession(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'TECHNICIAN' || user.role === 'TECHNICIAN_LEAD';
}
