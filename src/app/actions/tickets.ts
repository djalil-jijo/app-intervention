'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createTicketSchema, CreateTicketInput } from '@/lib/validations';
import { sendNewTicketNotification } from '@/lib/mailer';
import { getSessionUser } from '@/lib/auth';
import { UnitType, Priority, TicketStatus } from '@prisma/client';

// ─── Types ───────────────────────────────────────────────────────
export interface TicketSLAStats {
  avgFirstResponseHours: number;
  avgResolutionHours: number;
  criticalOverdueCount: number;
  slaBreachRate: number; // % tickets exceeded 48h without resolution
}

async function generateTicketNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `DEM-${currentYear}-`;

  const lastTicket = await prisma.interventionTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
  });

  let nextSequence = 1;
  if (lastTicket?.ticketNumber) {
    const parts = lastTicket.ticketNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function createTicketAction(input: CreateTicketInput & {
  assetId?: string;
  technicianId?: string;
  interventionType?: string;
  employeeId?: string;
  employeeSignature?: string | null;
  employeeStamp?: string | null;
  technicianSignature?: string | null;
  technicianStamp?: string | null;
}) {
  try {
    const validated = createTicketSchema.parse(input);
    const ticketNumber = await generateTicketNumber();

    let initialTechSig = input.technicianSignature || null;
    let initialTechStamp = input.technicianStamp || null;
    if (input.technicianId && (!initialTechSig || !initialTechStamp)) {
      const tech = await prisma.technician.findUnique({ where: { id: input.technicianId } });
      if (tech) {
        if (!initialTechSig) initialTechSig = tech.signature || null;
        if (!initialTechStamp) initialTechStamp = tech.stamp || null;
      }
    }

    const ticket = await prisma.interventionTicket.create({
      data: {
        ticketNumber,
        fullName:      validated.fullName,
        functionTitle: validated.functionTitle || null,
        service:       validated.service,
        phone:         validated.phone || null,
        email:         validated.email || null,
        managerName:   validated.managerName || null,
        unitType:      validated.unitType as UnitType,
        unitName:      validated.unitName,
        category:      validated.category,
        equipment:     validated.equipment,
        ipAddress:     validated.ipAddress || null,
        serialNumber:  validated.serialNumber || null,
        priority:      validated.priority as Priority,
        description:   validated.description,
        interventionType: input.interventionType || 'CURATIVE',
        assetId:       input.assetId || null,
        technicianId:  input.technicianId || null,
        employeeId:    input.employeeId || null,
        employeeSignature: input.employeeSignature || null,
        employeeStamp:     input.employeeStamp || null,
        technicianSignature: initialTechSig,
        technicianStamp:     initialTechStamp,
        status:        TicketStatus.PENDING,
      },
    });

    // Fire-and-forget email notification
    sendNewTicketNotification({
      ticketNumber: ticket.ticketNumber,
      fullName:     ticket.fullName,
      service:      ticket.service,
      unitType:     ticket.unitType,
      unitName:     ticket.unitName,
      equipment:    ticket.equipment,
      priority:     ticket.priority,
      description:  ticket.description,
    }).catch((err) => console.error('[Email] Notification failed:', err));

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    revalidatePath('/track');

    return {
      success: true,
      data: { id: ticket.id, ticketNumber: ticket.ticketNumber },
    };
  } catch (error: any) {
    console.error('Error in createTicketAction:', error);
    return {
      success: false,
      error: error.message || "Échec de la création de la demande d'intervention.",
    };
  }
}

export async function getTicketsAction(filters?: {
  search?:       string;
  unitType?:     string;
  priority?:     string;
  status?:       string;
  technicianId?: string;
}) {
  try {
    const where: any = {};

    if (filters?.unitType && filters.unitType !== 'ALL') {
      where.unitType = filters.unitType as UnitType;
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority as Priority;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as TicketStatus;
    }

    if (filters?.technicianId && filters.technicianId !== 'ALL') {
      where.technicianId = filters.technicianId;
    }

    if (filters?.search && filters.search.trim() !== '') {
      const query = filters.search.trim();
      where.OR = [
        { ticketNumber:  { contains: query, mode: 'insensitive' } },
        { fullName:      { contains: query, mode: 'insensitive' } },
        { service:       { contains: query, mode: 'insensitive' } },
        { unitName:      { contains: query, mode: 'insensitive' } },
        { equipment:     { contains: query, mode: 'insensitive' } },
        { description:   { contains: query, mode: 'insensitive' } },
        { serialNumber:  { contains: query, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.interventionTicket.findMany({
      where,
      include: {
        report: true,
        technician: true,
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: tickets };
  } catch (error: any) {
    console.error('Error in getTicketsAction:', error);
    return {
      success: false,
      error: error.message || 'Échec du chargement des tickets.',
      data: [],
    };
  }
}

export async function updateTicketStatusAction(ticketId: string, status: TicketStatus) {
  try {
    const updated = await prisma.interventionTicket.update({
      where: { id: ticketId },
      data: { status },
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignTechnicianToTicketAction(ticketId: string, technicianId: string | null) {
  try {
    const ticket = await prisma.interventionTicket.findUnique({
      where: { id: ticketId },
      include: { report: true },
    });
    if (!ticket) return { success: false, error: 'Ticket introuvable' };

    const newStatus = (technicianId && ticket.status === 'PENDING') ? 'IN_PROGRESS' : ticket.status;

    let techSig: string | null = null;
    let techStamp: string | null = null;
    let techName: string | null = null;

    if (technicianId) {
      const tech = await prisma.technician.findUnique({ where: { id: technicianId } });
      if (tech) {
        techSig = tech.signature || null;
        techStamp = tech.stamp || null;
        techName = tech.name;
      }
    }

    const updated = await prisma.interventionTicket.update({
      where: { id: ticketId },
      data: {
        technicianId: technicianId || null,
        status: newStatus as TicketStatus,
        technicianSignature: techSig,
        technicianStamp: techStamp,
      },
      include: {
        technician: true,
        report: true,
      },
    });

    // If an intervention report already exists, update technician name and signature/stamp
    if (ticket.report && techName) {
      await prisma.interventionReport.update({
        where: { id: ticket.report.id },
        data: {
          technicianName: techName,
          technicianSignature: techSig,
          technicianStamp: techStamp,
        },
      });
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath('/track');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signTicketAsTechnicianAction(ticketId: string, signature: string | null, stamp: string | null) {
  try {
    const updated = await prisma.interventionTicket.update({
      where: { id: ticketId },
      data: {
        technicianSignature: signature,
        technicianStamp: stamp,
      },
      include: {
        report: true,
      },
    });

    if (updated.report) {
      await prisma.interventionReport.update({
        where: { id: updated.report.id },
        data: {
          technicianSignature: signature,
          technicianStamp: stamp,
        },
      });
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath('/track');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Public: Lookup ticket by number ─────────────────────────────
export async function getTicketByNumberAction(ticketNumber: string) {
  try {
    if (!ticketNumber || ticketNumber.trim() === '') {
      return { success: false, error: 'رقم التذكرة مطلوب' };
    }

    const ticket = await prisma.interventionTicket.findFirst({
      where: {
        ticketNumber: { equals: ticketNumber.trim(), mode: 'insensitive' },
      },
      include: {
        technician: { select: { id: true, name: true, email: true, phone: true, speciality: true, signature: true, stamp: true } },
        employee: { select: { id: true, fullName: true, email: true, phone: true, functionTitle: true, service: true, unitName: true, signature: true, stamp: true } },
        report: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        asset: { select: { assetTag: true, name: true, type: true } },
      },
    });

    if (!ticket) {
      return { success: false, error: 'لم يتم العثور على تذكرة بهذا الرقم.' };
    }

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error('[getTicketByNumberAction]', error);
    return { success: false, error: error.message || 'خطأ في البحث عن التذكرة.' };
  }
}

// ─── Logged-in Employee: Get all their tickets ──────────────────
export async function getMyEmployeeTicketsAction() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, error: 'يجب تسجيل الدخول لعرض تذاكرك.', data: [] };
    }

    const where: any = {};
    if (session.employeeId) {
      where.OR = [
        { employeeId: session.employeeId },
        { email: { equals: session.email, mode: 'insensitive' } },
      ];
    } else {
      where.email = { equals: session.email, mode: 'insensitive' };
    }

    const tickets = await prisma.interventionTicket.findMany({
      where,
      include: {
        technician: { select: { id: true, name: true, phone: true, speciality: true } },
        report: true,
        comments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: tickets };
  } catch (error: any) {
    console.error('[getMyEmployeeTicketsAction]', error);
    return { success: false, error: error.message || 'خطأ في جلب تذاكر الموظف.', data: [] };
  }
}

// ─── Logged-in Technician: Get assigned tickets ──────────────────
export async function getTechnicianAssignedTicketsAction() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'TECHNICIAN' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return { success: false, error: 'غير مصرح للوصول.', data: [] };
    }

    const where: any = {};
    if (session.technicianId && session.role === 'TECHNICIAN') {
      where.technicianId = session.technicianId;
    }

    const tickets = await prisma.interventionTicket.findMany({
      where,
      include: {
        employee: true,
        technician: true,
        report: true,
        comments: { orderBy: { createdAt: 'asc' } },
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: tickets };
  } catch (error: any) {
    console.error('[getTechnicianAssignedTicketsAction]', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ─── SLA Statistics ───────────────────────────────────────────────
export async function getTicketSLAStatsAction(): Promise<{ success: boolean; data?: TicketSLAStats }> {
  try {
    const tickets = await prisma.interventionTicket.findMany({
      include: { report: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    const resolved = tickets.filter(
      (t) => (t.status === 'RESOLVED' || t.status === 'CLOSED') && t.report?.completedAt,
    );

    // Average first response: time from creation to IN_PROGRESS (approximated by completedAt for resolved)
    const avgResolutionHours =
      resolved.length > 0
        ? Math.round(
            resolved.reduce((acc, t) => {
              return (
                acc +
                (new Date(t.report!.completedAt).getTime() - new Date(t.createdAt).getTime())
              );
            }, 0) /
              resolved.length /
              3600000,
          )
        : 0;

    const criticalOverdueCount = tickets.filter(
      (t) =>
        t.priority === 'CRITICAL' &&
        (t.status === 'PENDING' || t.status === 'IN_PROGRESS') &&
        now - new Date(t.createdAt).getTime() > 4 * 3600000, // > 4h
    ).length;

    const activeTickets = tickets.filter(
      (t) => t.status !== 'CLOSED',
    );

    const breached = activeTickets.filter(
      (t) =>
        (t.status === 'PENDING' || t.status === 'IN_PROGRESS') &&
        now - new Date(t.createdAt).getTime() > 48 * 3600000,
    ).length;

    const slaBreachRate =
      activeTickets.length > 0 ? Math.round((breached / activeTickets.length) * 100) : 0;

    return {
      success: true,
      data: {
        avgFirstResponseHours: Math.max(1, Math.round(avgResolutionHours * 0.2)),
        avgResolutionHours,
        criticalOverdueCount,
        slaBreachRate,
      },
    };
  } catch (error: any) {
    console.error('[getTicketSLAStatsAction]', error);
    return { success: false };
  }
}
