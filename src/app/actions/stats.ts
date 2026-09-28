'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStatsAction() {
  try {
    const [
      tickets,
      assets,
      spareParts,
      technicians,
      maintenanceSchedules,
    ] = await Promise.all([
      prisma.interventionTicket.findMany({
        include: { technician: true, report: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.iTAsset.findMany(),
      prisma.sparePart.findMany(),
      prisma.technician.findMany({ where: { active: true } }),
      prisma.maintenanceSchedule.findMany({
        where: {
          scheduledDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: { asset: true, technician: true },
        orderBy: { scheduledDate: 'asc' },
        take: 5,
      }),
    ]);

    // Tickets by status
    const byStatus = {
      PENDING: tickets.filter((t) => t.status === 'PENDING').length,
      IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
      CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
    };

    // Tickets by priority
    const byPriority = {
      LOW: tickets.filter((t) => t.priority === 'LOW').length,
      MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
      URGENT: tickets.filter((t) => t.priority === 'URGENT').length,
      CRITICAL: tickets.filter((t) => t.priority === 'CRITICAL').length,
    };

    // Tickets by unit type
    const byUnitType = {
      FILIALE: tickets.filter((t) => t.unitType === 'FILIALE').length,
      CIC: tickets.filter((t) => t.unitType === 'CIC').length,
      UPC: tickets.filter((t) => t.unitType === 'UPC').length,
    };

    // Monthly trend (last 6 months)
    const monthlyTrend = buildMonthlyTrend(tickets);

    // Technician performance
    const technicianStats = buildTechnicianStats(tickets, technicians);

    // Assets stats
    const assetStats = {
      total: assets.length,
      operational: assets.filter((a) => a.status === 'OPERATIONAL').length,
      defective: assets.filter((a) => a.status === 'DEFECTIVE').length,
      underMaintenance: assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length,
      scrapped: assets.filter((a) => a.status === 'SCRAPPED').length,
    };

    // Stock stats
    const stockStats = {
      total: spareParts.length,
      lowStock: spareParts.filter((p) => p.quantity <= p.minThreshold).length,
      outOfStock: spareParts.filter((p) => p.quantity === 0).length,
    };

    // Resolution rate
    const resolved = byStatus.RESOLVED + byStatus.CLOSED;
    const resolutionRate = tickets.length > 0 ? Math.round((resolved / tickets.length) * 100) : 0;

    // Average resolution time (in hours, for resolved tickets with reports)
    const avgResolutionHours = computeAvgResolutionHours(tickets);

    // CRITICAL tickets pending > 24h
    const criticalPending = tickets.filter(
      (t) =>
        t.priority === 'CRITICAL' &&
        (t.status === 'PENDING' || t.status === 'IN_PROGRESS') &&
        Date.now() - new Date(t.createdAt).getTime() > 24 * 60 * 60 * 1000,
    ).length;

    // PENDING tickets > 48h without technician
    const pendingNoTech = tickets.filter(
      (t) =>
        t.status === 'PENDING' &&
        !t.technicianId &&
        Date.now() - new Date(t.createdAt).getTime() > 48 * 60 * 60 * 1000,
    ).length;

    // Tickets by intervention type
    const byInterventionType = {
      CURATIVE:     tickets.filter((t) => t.interventionType === 'CURATIVE').length,
      PREVENTIVE:   tickets.filter((t) => t.interventionType === 'PREVENTIVE').length,
      INSTALLATION: tickets.filter((t) => t.interventionType === 'INSTALLATION').length,
    };

    // SLA breach: tickets open > 48h without resolution
    const activeTickets = tickets.filter((t) => t.status !== 'CLOSED');
    const breachedSLA = activeTickets.filter(
      (t) =>
        (t.status === 'PENDING' || t.status === 'IN_PROGRESS') &&
        Date.now() - new Date(t.createdAt).getTime() > 48 * 3600000,
    ).length;
    const slaBreachRate =
      activeTickets.length > 0 ? Math.round((breachedSLA / activeTickets.length) * 100) : 0;

    // Daily close rate (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const closedLast7 = tickets.filter(
      (t) =>
        (t.status === 'RESOLVED' || t.status === 'CLOSED') &&
        new Date(t.updatedAt) >= last7Days,
    ).length;

    return {
      success: true,
      data: {
        byStatus,
        byPriority,
        byUnitType,
        byInterventionType,
        monthlyTrend,
        technicianStats,
        assetStats,
        stockStats,
        resolutionRate,
        avgResolutionHours,
        criticalPending,
        pendingNoTech,
        slaBreachRate,
        closedLast7Days: closedLast7,
        upcomingMaintenance: maintenanceSchedules,
        totalTickets: tickets.length,
        totalTechnicians: technicians.length,
      },
    };
  } catch (error: any) {
    console.error('[getDashboardStatsAction]', error);
    return { success: false, error: error.message };
  }
}

function buildMonthlyTrend(tickets: any[]) {
  const months: { month: string; total: number; resolved: number; pending: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthTickets = tickets.filter((t) => {
      const td = new Date(t.createdAt);
      return td.getFullYear() === year && td.getMonth() === month;
    });
    months.push({
      month: d.toLocaleDateString('ar-DZ', { month: 'short', year: '2-digit' }),
      total: monthTickets.length,
      resolved: monthTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
      pending: monthTickets.filter((t) => t.status === 'PENDING').length,
    });
  }
  return months;
}

function buildTechnicianStats(tickets: any[], technicians: any[]) {
  return technicians.map((tech) => {
    const techTickets = tickets.filter((t) => t.technicianId === tech.id);
    const resolved = techTickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
    ).length;
    return {
      id: tech.id,
      name: tech.name,
      total: techTickets.length,
      resolved,
      pending: techTickets.filter((t) => t.status === 'PENDING').length,
      inProgress: techTickets.filter((t) => t.status === 'IN_PROGRESS').length,
      rate: techTickets.length > 0 ? Math.round((resolved / techTickets.length) * 100) : 0,
    };
  }).sort((a, b) => b.total - a.total);
}

function computeAvgResolutionHours(tickets: any[]) {
  const resolved = tickets.filter(
    (t) => (t.status === 'RESOLVED' || t.status === 'CLOSED') && t.report?.completedAt,
  );
  if (resolved.length === 0) return 0;
  const totalMs = resolved.reduce((acc, t) => {
    return acc + (new Date(t.report.completedAt).getTime() - new Date(t.createdAt).getTime());
  }, 0);
  return Math.round(totalMs / resolved.length / 1000 / 60 / 60);
}
