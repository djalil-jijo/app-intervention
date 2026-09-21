'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { MaintenanceStatus, Priority } from '@prisma/client';

export async function getMaintenanceSchedulesAction(filters?: {
  status?: string;
  technicianId?: string;
}) {
  try {
    const where: any = {};
    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as MaintenanceStatus;
    }
    if (filters?.technicianId && filters.technicianId !== 'ALL') {
      where.technicianId = filters.technicianId;
    }

    const schedules = await prisma.maintenanceSchedule.findMany({
      where,
      include: {
        asset: true,
        technician: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return { success: true, data: schedules };
  } catch (error: any) {
    console.error('[getMaintenanceSchedulesAction]', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createMaintenanceScheduleAction(input: {
  title: string;
  description?: string;
  assetId?: string;
  technicianId?: string;
  scheduledDate: string | Date;
  intervalDays?: number;
  priority?: Priority;
  notes?: string;
}) {
  try {
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: input.title,
        description: input.description || null,
        assetId: input.assetId || null,
        technicianId: input.technicianId || null,
        scheduledDate: new Date(input.scheduledDate),
        intervalDays: input.intervalDays ? Number(input.intervalDays) : null,
        priority: input.priority || Priority.MEDIUM,
        notes: input.notes || null,
        status: MaintenanceStatus.SCHEDULED,
      },
    });

    revalidatePath('/admin/maintenance');
    revalidatePath('/admin/dashboard');
    return { success: true, data: schedule };
  } catch (error: any) {
    console.error('[createMaintenanceScheduleAction]', error);
    return { success: false, error: error.message };
  }
}

export async function updateMaintenanceStatusAction(id: string, status: MaintenanceStatus) {
  try {
    const data: any = { status };
    if (status === MaintenanceStatus.DONE) {
      data.completedAt = new Date();
    }

    const updated = await prisma.maintenanceSchedule.update({
      where: { id },
      data,
    });

    // If recurrent and marked as done, create next schedule!
    if (status === MaintenanceStatus.DONE && updated.intervalDays && updated.intervalDays > 0) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + updated.intervalDays);

      await prisma.maintenanceSchedule.create({
        data: {
          title: updated.title,
          description: updated.description,
          assetId: updated.assetId,
          technicianId: updated.technicianId,
          scheduledDate: nextDate,
          intervalDays: updated.intervalDays,
          priority: updated.priority,
          notes: `تم توليدها تلقائياً بعد إتمام الجدولة السابقة.`,
          status: MaintenanceStatus.SCHEDULED,
        },
      });
    }

    revalidatePath('/admin/maintenance');
    revalidatePath('/admin/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[updateMaintenanceStatusAction]', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMaintenanceScheduleAction(id: string) {
  try {
    await prisma.maintenanceSchedule.delete({ where: { id } });
    revalidatePath('/admin/maintenance');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteMaintenanceScheduleAction]', error);
    return { success: false, error: error.message };
  }
}
