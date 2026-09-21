import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderExecutiveReportPDFToBuffer } from '@/lib/pdf';
import { ExecutiveReportData } from '@/components/pdf/ExecutiveReportPDF';

export async function GET(req: NextRequest) {
  try {
    const isInline = req.nextUrl.searchParams.get('inline') === 'true';

    const [tickets, assets, decharges, spareParts] = await Promise.all([
      prisma.interventionTicket.findMany({
        include: { report: true },
      }),
      prisma.iTAsset.findMany(),
      prisma.equipmentDecharge.findMany(),
      prisma.sparePart.findMany(),
    ]);

    // Tickets metrics
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
    ).length;
    const resolutionRate =
      totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // MTTR calculation
    const resolvedWithReports = tickets.filter(
      (t) => (t.status === 'RESOLVED' || t.status === 'CLOSED') && t.report?.completedAt,
    );
    let avgResolutionHours = 0;
    if (resolvedWithReports.length > 0) {
      const totalMs = resolvedWithReports.reduce((acc, t) => {
        return (
          acc +
          (new Date(t.report!.completedAt).getTime() - new Date(t.createdAt).getTime())
        );
      }, 0);
      avgResolutionHours = Math.round(totalMs / resolvedWithReports.length / 1000 / 60 / 60);
    }

    // Critical pending
    const criticalPending = tickets.filter(
      (t) =>
        t.priority === 'CRITICAL' &&
        (t.status === 'PENDING' || t.status === 'IN_PROGRESS'),
    ).length;

    // Assets metrics
    const totalAssets = assets.length;
    const operationalAssets = assets.filter((a) => a.status === 'OPERATIONAL').length;
    const availabilityRate =
      totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 0;

    // By Structure
    const structures = [
      { key: 'FILIALE', name: 'Directions Régionales (Filiales)' },
      { key: 'CIC', name: 'Directions de Wilaya (CIC)' },
      { key: 'UPC', name: 'Unités de Production (UPC)' },
    ];

    const byStructure = structures.map((s) => {
      const structTickets = tickets.filter((t) => t.unitType === s.key);
      const structResolved = structTickets.filter(
        (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
      ).length;
      const rate =
        structTickets.length > 0
          ? `${Math.round((structResolved / structTickets.length) * 100)}%`
          : 'N/A';
      return {
        name: s.name,
        total: structTickets.length,
        resolved: structResolved,
        pending: structTickets.filter((t) => t.status === 'PENDING').length,
        rate,
      };
    });

    // By Priority
    const priorityLabels: Record<string, string> = {
      CRITICAL: 'Critique & Haute Urgence',
      URGENT: 'Urgente',
      MEDIUM: 'Moyenne / Standard',
      LOW: 'Basse / Secondaire',
    };

    const priorities = ['CRITICAL', 'URGENT', 'MEDIUM', 'LOW'];
    const byPriority = priorities.map((p) => {
      const count = tickets.filter((t) => t.priority === p).length;
      const pct = totalTickets > 0 ? `${Math.round((count / totalTickets) * 100)}%` : '0%';
      return {
        priority: priorityLabels[p] || p,
        count,
        pct,
      };
    });

    // By Asset Type
    const assetTypes = [
      { key: 'DESKTOP', label: 'Postes Fixes (Desktops)' },
      { key: 'LAPTOP', label: 'PC Portables (Laptops)' },
      { key: 'SERVER', label: 'Serveurs & Infrastructure' },
      { key: 'SWITCH_ROUTER', label: 'Équipements Réseau' },
      { key: 'PRINTER', label: 'Imprimantes & Copieurs' },
    ];

    const byAssetType = assetTypes.map((at) => {
      const matching = assets.filter((a) => a.type === at.key);
      const op = matching.filter((a) => a.status === 'OPERATIONAL').length;
      return {
        type: at.label,
        total: matching.length,
        operational: op,
      };
    });

    // Decharges metrics
    const totalDecharges = decharges.length;
    const activeDecharges = decharges.filter((d) => d.status === 'ACTIVE').length;

    // Spare parts
    const totalSpareParts = spareParts.length;
    const lowStockItems = spareParts.filter((p) => p.quantity <= p.minThreshold).length;

    const reportYear = new Date().getFullYear();
    const reportRef = `AUDIT-IT-${reportYear}-${String(totalTickets).padStart(4, '0')}`;
    const reportDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const reportData: ExecutiveReportData = {
      reportDate,
      reportRef,
      totalTickets,
      resolvedTickets,
      resolutionRate,
      avgResolutionHours,
      totalAssets,
      operationalAssets,
      availabilityRate,
      criticalPending,
      totalDecharges,
      activeDecharges,
      totalSpareParts,
      lowStockItems,
      byStructure,
      byPriority,
      byAssetType,
    };

    const pdfBuffer = await renderExecutiveReportPDFToBuffer(reportData);
    const filename = `Rapport_Executif_IT_${reportYear}.pdf`;
    const dispositionType = isInline ? 'inline' : 'attachment';

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${dispositionType}; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Executive PDF Export Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
