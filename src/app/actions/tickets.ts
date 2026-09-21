'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createTicketSchema, CreateTicketInput } from '@/lib/validations';
import { sendNewTicketNotification } from '@/lib/mailer';
import { UnitType, Priority, TicketStatus } from '@prisma/client';

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

export async function createTicketAction(input: CreateTicketInput & { assetId?: string; technicianId?: string; interventionType?: string }) {
  try {
    const validated = createTicketSchema.parse(input);
    const ticketNumber = await generateTicketNumber();

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
    const ticket = await prisma.interventionTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: 'Ticket introuvable' };

    const newStatus = (technicianId && ticket.status === 'PENDING') ? 'IN_PROGRESS' : ticket.status;

    const updated = await prisma.interventionTicket.update({
      where: { id: ticketId },
      data: {
        technicianId: technicianId || null,
        status: newStatus as TicketStatus,
      },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
