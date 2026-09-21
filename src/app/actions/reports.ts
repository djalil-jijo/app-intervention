'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createReportSchema, CreateReportInput } from '@/lib/validations';
import { TicketStatus } from '@prisma/client';

async function generateReportNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INT-${currentYear}-`;

  const lastReport = await prisma.interventionReport.findFirst({
    where: {
      reportNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  let nextSequence = 1;
  if (lastReport && lastReport.reportNumber) {
    const parts = lastReport.reportNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  const paddedSeq = String(nextSequence).padStart(3, '0');
  return `${prefix}${paddedSeq}`;
}

export async function createReportAction(input: CreateReportInput & { durationMinutes?: number; usedSparePartId?: string; usedQuantity?: number }) {
  try {
    const validated = createReportSchema.parse(input);

    // Fetch target ticket
    const ticket = await prisma.interventionTicket.findUnique({
      where: { id: validated.ticketId },
    });

    if (!ticket) {
      return {
        success: false,
        error: 'Ticket introuvable.',
      };
    }

    const reportNumber = await generateReportNumber();

    // Deduct stock if a spare part was used
    if (input.usedSparePartId && input.usedQuantity && input.usedQuantity > 0) {
      const part = await prisma.sparePart.findUnique({ where: { id: input.usedSparePartId } });
      if (part) {
        const newQty = Math.max(0, part.quantity - input.usedQuantity);
        await prisma.sparePart.update({
          where: { id: part.id },
          data: { quantity: newQty }
        });
        await prisma.stockMovement.create({
          data: {
            sparePartId: part.id,
            movementType: 'OUT',
            quantity: input.usedQuantity,
            reason: `Intervention ${reportNumber} (Ticket ${ticket.ticketNumber})`,
            ticketId: ticket.id,
            performedBy: validated.technicianName
          }
        });
      }
    }

    // Transaction: Create Report & set Ticket status to RESOLVED
    const [report, updatedTicket] = await prisma.$transaction([
      prisma.interventionReport.create({
        data: {
          reportNumber,
          ticketId: ticket.id,
          technicianName: validated.technicianName,
          diagnosis: validated.diagnosis,
          actionsTaken: validated.actionsTaken,
          partsReplaced: validated.partsReplaced || null,
          durationMinutes: input.durationMinutes || 60,
          finalStatus: validated.finalStatus,
        },
      }),
      prisma.interventionTicket.update({
        where: { id: ticket.id },
        data: { status: TicketStatus.RESOLVED },
      }),
    ]);

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    revalidatePath('/admin/stock');

    return {
      success: true,
      data: {
        reportId: report.id,
        reportNumber: report.reportNumber,
        ticketNumber: ticket.ticketNumber,
      },
    };
  } catch (error: any) {
    console.error('Error in createReportAction:', error);
    return {
      success: false,
      error: error.message || 'Échec de la validation du rapport d\'intervention.',
    };
  }
}
