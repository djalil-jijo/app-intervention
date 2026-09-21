'use server';

import { setAdminSessionCookie, clearAdminSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function loginAdminAction(loginInput: string, pass: string) {
  try {
    const cleanInput = loginInput.trim().toLowerCase();

    // 1. Try DB AdminUser first (by email or username)
    try {
      const user = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: { equals: cleanInput, mode: 'insensitive' } },
            { username: { equals: cleanInput, mode: 'insensitive' } },
          ],
        },
      });

      if (user && user.active) {
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
          await setAdminSessionCookie();
          return { success: true };
        }
      }
    } catch (dbErr) {
      console.warn('[loginAdminAction] DB user check failed, checking fallback credentials:', dbErr);
    }

    // 2. Fallback to ENV or default credentials
    const validEmail = process.env.ADMIN_EMAIL || 'admin@enterprise.com';
    const validPass = process.env.ADMIN_PASSWORD || 'Admin2026!';

    if (
      (cleanInput === validEmail.trim().toLowerCase() || cleanInput === 'admin' || cleanInput === 'superadmin') &&
      pass === validPass
    ) {
      await setAdminSessionCookie();
      return { success: true };
    }

    return {
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    };
  } catch (error: any) {
    console.error('Error in loginAdminAction:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء محاولة تسجيل الدخول.',
    };
  }
}

export async function logoutAdminAction() {
  try {
    await clearAdminSessionCookie();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
