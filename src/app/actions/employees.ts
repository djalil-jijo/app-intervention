'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { UnitType } from '@prisma/client';
import { getSessionUser, UserRole } from '@/lib/auth';

// الأدوار المسموح لها بإدارة حسابات الموظفين (إنشاء / تعديل / حذف)
const WRITE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN_LEAD', 'TECHNICIAN'];
// الأدوار المسموح لها بالحذف فقط (مسؤولون رسميون)
const DELETE_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
// الأدوار المسموح لها بالاطلاع على قائمة الموظفين
const READ_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN_LEAD', 'TECHNICIAN'];

async function requireRole(allowedRoles: UserRole[]) {
  const user = await getSessionUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}

export async function getEmployeesAction() {
  try {
    const user = await requireRole(READ_ROLES);
    if (!user) {
      return { success: false, error: 'غير مصرح. يجب تسجيل الدخول كمسؤول أو تقني.', data: [] };
    }

    const employees = await prisma.employee.findMany({
      orderBy: { fullName: 'asc' },
      include: {
        tickets: {
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        },
      },
    });

    const formatted = employees.map((emp) => {
      const activeTickets = emp.tickets.filter(
        (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'
      ).length;
      const resolvedTickets = emp.tickets.filter(
        (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
      ).length;

      return {
        ...emp,
        activeTickets,
        resolvedTickets,
        totalTickets: emp.tickets.length,
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('[getEmployeesAction] Error:', error);
    return { success: false, error: error.message || 'خطأ في جلب الموظفين', data: [] };
  }
}

export async function createEmployeeAdminAction(data: {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  phone?: string;
  functionTitle?: string;
  service: string;
  unitType: UnitType;
  unitName: string;
  managerName?: string;
  signature?: string;
  stamp?: string;
}) {
  try {
    const manager = await requireRole(WRITE_ROLES);
    if (!manager) {
      return { success: false, error: 'غير مصرح. يجب تسجيل الدخول كمسؤول أو تقني لإنشاء حسابات.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase();

    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      return { success: false, error: 'البريد الإلكتروني أو اسم المستخدم مسجل مسبقاً.' };
    }

    const defaultPass = data.password || 'Emp2026!';
    const passwordHash = await bcrypt.hash(defaultPass, 10);

    const emp = await prisma.employee.create({
      data: {
        fullName: data.fullName.trim(),
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        phone: data.phone?.trim() || null,
        functionTitle: data.functionTitle?.trim() || null,
        service: data.service.trim(),
        unitType: data.unitType,
        unitName: data.unitName.trim(),
        managerName: data.managerName?.trim() || null,
        signature: data.signature || null,
        stamp: data.stamp || null,
        active: true,
      },
    });

    revalidatePath('/admin/employees');
    return { success: true, data: emp };
  } catch (error: any) {
    console.error('[createEmployeeAdminAction] Error:', error);
    return { success: false, error: error.message || 'فشل في إنشاء حساب الموظف' };
  }
}

export async function updateEmployeeAdminAction(
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    functionTitle?: string;
    service?: string;
    unitType?: UnitType;
    unitName?: string;
    managerName?: string;
    signature?: string | null;
    stamp?: string | null;
    password?: string;
    active?: boolean;
  }
) {
  try {
    const manager = await requireRole(WRITE_ROLES);
    if (!manager) {
      return { success: false, error: 'غير مصرح. يجب تسجيل الدخول كمسؤول أو تقني.' };
    }

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName.trim();
    if (data.email) updateData.email = data.email.trim().toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.functionTitle !== undefined) updateData.functionTitle = data.functionTitle?.trim() || null;
    if (data.service) updateData.service = data.service.trim();
    if (data.unitType) updateData.unitType = data.unitType;
    if (data.unitName) updateData.unitName = data.unitName.trim();
    if (data.managerName !== undefined) updateData.managerName = data.managerName?.trim() || null;
    if (data.signature !== undefined) updateData.signature = data.signature;
    if (data.stamp !== undefined) updateData.stamp = data.stamp;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.password && data.password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(data.password.trim(), 10);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/employees');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[updateEmployeeAdminAction] Error:', error);
    return { success: false, error: error.message || 'فشل في تحديث حساب الموظف' };
  }
}

export async function deleteEmployeeAdminAction(id: string) {
  try {
    const manager = await requireRole(DELETE_ROLES);
    if (!manager) {
      return { success: false, error: 'غير مصرح. حذف الحسابات مقيد بالمسؤول الرئيسي فقط.' };
    }

    await prisma.employee.delete({ where: { id } });
    revalidatePath('/admin/employees');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteEmployeeAdminAction] Error:', error);
    return { success: false, error: error.message || 'فشل في حذف حساب الموظف' };
  }
}
