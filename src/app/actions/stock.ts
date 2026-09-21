'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSparePartsAction(params?: {
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}) {
  try {
    const where: any = {};

    if (params?.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { partNumber: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const parts = await prisma.sparePart.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    let filtered = parts;
    if (params?.lowStockOnly) {
      filtered = parts.filter(p => p.quantity <= p.minThreshold);
    }

    return { success: true, data: filtered };
  } catch (error: any) {
    console.error('Error fetching spare parts:', error);
    return { success: false, error: error.message || 'Erreur lors du chargement du stock' };
  }
}

export async function createSparePartAction(data: {
  name: string;
  partNumber?: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  location?: string;
}) {
  try {
    const newPart = await prisma.sparePart.create({
      data: {
        name: data.name,
        partNumber: data.partNumber,
        category: data.category || 'Consommables',
        quantity: Math.max(0, data.quantity),
        minThreshold: Math.max(1, data.minThreshold),
        unitPrice: Math.max(0, data.unitPrice),
        location: data.location,
        movements: {
          create: {
            movementType: 'IN',
            quantity: Math.max(0, data.quantity),
            reason: 'Initialisation du stock',
            performedBy: 'Système ERP'
          }
        }
      }
    });

    revalidatePath('/admin/stock');
    return { success: true, data: newPart };
  } catch (error: any) {
    console.error('Error creating spare part:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la pièce' };
  }
}

export async function recordStockMovementAction(data: {
  sparePartId: string;
  movementType: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
  ticketId?: string;
  performedBy?: string;
}) {
  try {
    const part = await prisma.sparePart.findUnique({ where: { id: data.sparePartId } });
    if (!part) return { success: false, error: 'Article non trouvé' };

    let newQuantity = part.quantity;
    if (data.movementType === 'IN') {
      newQuantity += data.quantity;
    } else {
      if (part.quantity < data.quantity) {
        return { success: false, error: `Quantité en stock insuffisante (${part.quantity} dispo)` };
      }
      newQuantity -= data.quantity;
    }

    await prisma.$transaction([
      prisma.sparePart.update({
        where: { id: data.sparePartId },
        data: { quantity: newQuantity }
      }),
      prisma.stockMovement.create({
        data: {
          sparePartId: data.sparePartId,
          movementType: data.movementType,
          quantity: data.quantity,
          reason: data.reason || (data.movementType === 'IN' ? 'Approvisionnement' : 'Utilisation dans intervention'),
          ticketId: data.ticketId,
          performedBy: data.performedBy || 'Technicien'
        }
      })
    ]);

    revalidatePath('/admin/stock');
    return { success: true };
  } catch (error: any) {
    console.error('Error recording movement:', error);
    return { success: false, error: error.message || 'Erreur lors du mouvement de stock' };
  }
}

export async function deleteSparePartAction(id: string) {
  try {
    await prisma.sparePart.delete({ where: { id } });
    revalidatePath('/admin/stock');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting spare part:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}
