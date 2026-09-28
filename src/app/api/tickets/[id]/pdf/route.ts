import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderReportPDFToBuffer, renderTicketPDFToBuffer } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const isInline = searchParams.get('inline') === 'true';
    const forceTicketOnly = searchParams.get('type') === 'ticket';

    const ticket = await prisma.interventionTicket.findUnique({
      where: { id },
      include: {
        report: true,
        employee: true,
        technician: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket introuvable.' }, { status: 404 });
    }

    const resolvedEmployeeSignature = ticket.employeeSignature || ticket.employee?.signature || null;
    const resolvedEmployeeStamp = ticket.employeeStamp || ticket.employee?.stamp || null;
    const resolvedTechnicianSignature = ticket.technicianSignature || ticket.technician?.signature || null;
    const resolvedTechnicianStamp = ticket.technicianStamp || ticket.technician?.stamp || null;

    let pdfBuffer: Buffer;
    let filename: string;

    if (ticket.report && !forceTicketOnly) {
      pdfBuffer = await renderReportPDFToBuffer(
        {
          ...ticket,
          employeeSignature: resolvedEmployeeSignature,
          employeeStamp: resolvedEmployeeStamp,
        },
        {
          ...ticket.report,
          technicianSignature: ticket.report.technicianSignature || resolvedTechnicianSignature,
          technicianStamp: ticket.report.technicianStamp || resolvedTechnicianStamp,
          clientSignature: ticket.report.clientSignature || resolvedEmployeeSignature,
        }
      );
      filename = `Fiche_Intervention_${ticket.report.reportNumber}_${ticket.ticketNumber}.pdf`;
    } else {
      pdfBuffer = await renderTicketPDFToBuffer({
        ...ticket,
        employeeSignature: resolvedEmployeeSignature,
        employeeStamp: resolvedEmployeeStamp,
        technicianSignature: resolvedTechnicianSignature,
        technicianStamp: resolvedTechnicianStamp,
      });
      filename = `Demande_Intervention_${ticket.ticketNumber}.pdf`;
    }

    const dispositionType = isInline ? 'inline' : 'attachment';

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF download:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF.' },
      { status: 500 }
    );
  }
}
