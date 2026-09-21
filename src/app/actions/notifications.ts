'use server';

import { prisma } from '@/lib/prisma';

export interface NotificationItem {
  id: string;
  type: 'CRITICAL_TICKET' | 'LOW_STOCK' | 'OVERDUE_MAINTENANCE' | 'UNASSIGNED_TICKET';
  title: string;
  message: string;
  link: string;
  severity: 'error' | 'warning' | 'info';
  createdAt: Date;
}

export async function getNotificationsAction(): Promise<{ success: boolean; data: NotificationItem[] }> {
  try {
    const notifications: NotificationItem[] = [];

    // 1. Critical Tickets
    const criticalTickets = await prisma.interventionTicket.findMany({
      where: {
        priority: 'CRITICAL',
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    criticalTickets.forEach((t) => {
      notifications.push({
        id: `crit-${t.id}`,
        type: 'CRITICAL_TICKET',
        title: `تذكرة حرجة: ${t.ticketNumber}`,
        message: `${t.equipment} - ${t.fullName} (${t.unitName}) بحاجة لتدخل فوري`,
        link: `/admin/tickets`,
        severity: 'error',
        createdAt: t.createdAt,
      });
    });

    // 2. Low stock items
    const lowStockParts = await prisma.sparePart.findMany({
      where: {
        quantity: { lte: 5 },
      },
      take: 5,
    });

    lowStockParts.forEach((p) => {
      notifications.push({
        id: `stock-${p.id}`,
        type: 'LOW_STOCK',
        title: `نفاذ مخزون: ${p.name}`,
        message: `الكمية الحالية (${p.quantity}) أقل من أو تساوي الحد الأدنى (${p.minThreshold})`,
        link: `/admin/stock`,
        severity: p.quantity === 0 ? 'error' : 'warning',
        createdAt: p.updatedAt,
      });
    });

    // 3. Overdue or upcoming maintenance
    const maintenance = await prisma.maintenanceSchedule.findMany({
      where: {
        status: { in: ['SCHEDULED', 'OVERDUE'] },
        scheduledDate: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      },
      take: 5,
      orderBy: { scheduledDate: 'asc' },
    });

    maintenance.forEach((m) => {
      const isPast = new Date(m.scheduledDate) < new Date();
      notifications.push({
        id: `maint-${m.id}`,
        type: 'OVERDUE_MAINTENANCE',
        title: isPast ? `صيانة متأخرة: ${m.title}` : `صيانة اليوم: ${m.title}`,
        message: `موعد التدخل الوقائي: ${new Date(m.scheduledDate).toLocaleDateString('ar-DZ')}`,
        link: `/admin/maintenance`,
        severity: isPast ? 'error' : 'info',
        createdAt: m.createdAt,
      });
    });

    // 4. Pending tickets unassigned > 24 hours
    const oldPending = await prisma.interventionTicket.findMany({
      where: {
        status: 'PENDING',
        technicianId: null,
        createdAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      take: 5,
      orderBy: { createdAt: 'asc' },
    });

    oldPending.forEach((t) => {
      notifications.push({
        id: `unassigned-${t.id}`,
        type: 'UNASSIGNED_TICKET',
        title: `طلب غير معيّن منذ فترة: ${t.ticketNumber}`,
        message: `الطلب مسجل منذ أكثر من 24 ساعة ولم يتم تكليف تقني به بعد`,
        link: `/admin/tickets`,
        severity: 'warning',
        createdAt: t.createdAt,
      });
    });

    return { success: true, data: notifications };
  } catch (error: any) {
    console.error('[getNotificationsAction]', error);
    return { success: false, data: [] };
  }
}
