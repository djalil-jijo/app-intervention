'use server';

import { prisma } from '@/lib/prisma';

export interface GlobalSearchResult {
  id: string;
  type: 'TICKET' | 'ASSET' | 'STOCK' | 'KNOWLEDGE' | 'TECHNICIAN' | 'DECHARGE';
  title: string;
  subtitle: string;
  link: string;
  tag?: string;
}

export async function globalSearchAction(query: string): Promise<{ success: boolean; data: GlobalSearchResult[] }> {
  try {
    const q = query.trim();
    if (!q || q.length < 2) return { success: true, data: [] };

    const [tickets, assets, spareParts, articles, technicians, decharges] = await Promise.all([
      // Tickets
      prisma.interventionTicket.findMany({
        where: {
          OR: [
            { ticketNumber: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
            { equipment: { contains: q, mode: 'insensitive' } },
            { unitName: { contains: q, mode: 'insensitive' } },
            { service: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // Assets
      prisma.iTAsset.findMany({
        where: {
          OR: [
            { assetTag: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { serialNumber: { contains: q, mode: 'insensitive' } },
            { assignedTo: { contains: q, mode: 'insensitive' } },
            { ipAddress: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // Stock
      prisma.sparePart.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { partNumber: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // Knowledge Base
      prisma.knowledgeArticle.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { problem: { contains: q, mode: 'insensitive' } },
            { solution: { contains: q, mode: 'insensitive' } },
            { tags: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // Technicians
      prisma.technician.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { speciality: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
      }),

      // Decharges
      prisma.equipmentDecharge.findMany({
        where: {
          OR: [
            { dechargeNumber: { contains: q, mode: 'insensitive' } },
            { beneficiaryName: { contains: q, mode: 'insensitive' } },
            { matricule: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: {
          items: true,
        },
        take: 4,
      }),
    ]);

    const results: GlobalSearchResult[] = [];

    decharges.forEach((d) => {
      results.push({
        id: `decharge-${d.id}`,
        type: 'DECHARGE',
        title: `${d.dechargeNumber} - ${d.beneficiaryName}`,
        subtitle: `${d.department} (${d.unitName}) - ${d.items.length} عتاد مسلّم`,
        link: `/admin/decharges`,
        tag: d.status === 'ACTIVE' ? 'مسلّم' : 'مسترجع',
      });
    });

    tickets.forEach((t) => {
      results.push({
        id: `ticket-${t.id}`,
        type: 'TICKET',
        title: `${t.ticketNumber} - ${t.equipment}`,
        subtitle: `${t.fullName} (${t.unitName} - ${t.service})`,
        link: `/admin/tickets`,
        tag: t.priority,
      });
    });

    assets.forEach((a) => {
      results.push({
        id: `asset-${a.id}`,
        type: 'ASSET',
        title: `${a.name} [${a.assetTag}]`,
        subtitle: `${a.unitName} - ${a.service || ''} ${a.assignedTo ? `(${a.assignedTo})` : ''}`,
        link: `/admin/assets`,
        tag: a.type,
      });
    });

    spareParts.forEach((s) => {
      results.push({
        id: `stock-${s.id}`,
        type: 'STOCK',
        title: s.name,
        subtitle: `الكمية المتوفرة: ${s.quantity} | الموقع: ${s.location || 'المخزن الرئيسي'}`,
        link: `/admin/stock`,
        tag: s.category,
      });
    });

    articles.forEach((k) => {
      results.push({
        id: `knowledge-${k.id}`,
        type: 'KNOWLEDGE',
        title: k.title,
        subtitle: `فئة: ${k.category} | ${k.author}`,
        link: `/admin/knowledge`,
        tag: 'حل تقني',
      });
    });

    technicians.forEach((tech) => {
      results.push({
        id: `tech-${tech.id}`,
        type: 'TECHNICIAN',
        title: tech.name,
        subtitle: `${tech.role} - تخصص: ${tech.speciality}`,
        link: `/admin/technicians`,
        tag: tech.phone || 'IT Team',
      });
    });

    return { success: true, data: results };
  } catch (error: any) {
    console.error('[GlobalSearchAction]', error);
    return { success: false, data: [] };
  }
}
