'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AdminRole } from '@prisma/client';

export async function getAdminUsersAction() {
  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error('[getAdminUsersAction]', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createAdminUserAction(input: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: AdminRole;
}) {
  try {
    if (!input.username || !input.email || !input.password || !input.fullName) {
      return { success: false, error: 'جميع الحقول مطلوبة' };
    }

    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }],
      },
    });

    if (existing) {
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً' };
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser = await prisma.adminUser.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role || AdminRole.ADMIN,
      },
    });

    revalidatePath('/admin/users');
    return { success: true, data: { id: newUser.id } };
  } catch (error: any) {
    console.error('[createAdminUserAction]', error);
    return { success: false, error: error.message };
  }
}

export async function toggleAdminUserStatusAction(id: string, active: boolean) {
  try {
    const updated = await prisma.adminUser.update({
      where: { id },
      data: { active },
    });
    revalidatePath('/admin/users');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[toggleAdminUserStatusAction]', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAdminUserAction(id: string) {
  try {
    await prisma.adminUser.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteAdminUserAction]', error);
    return { success: false, error: error.message };
  }
}
