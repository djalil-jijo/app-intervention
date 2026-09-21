'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAssetsAction(params?: {
  search?: string;
  unitType?: string;
  status?: string;
  type?: string;
}) {
  try {
    const where: any = {};

    if (params?.unitType && params.unitType !== 'ALL') {
      where.unitType = params.unitType;
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.type && params.type !== 'ALL') {
      where.type = params.type;
    }

    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim();
      where.OR = [
        { assetTag: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { assignedTo: { contains: q, mode: 'insensitive' } },
        { unitName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const assets = await prisma.iTAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    return { success: true, data: assets };
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return { success: false, error: error.message || 'Erreur lors du chargement des équipements' };
  }
}

export async function createAssetAction(data: {
  assetTag?: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  unitType: 'FILIALE' | 'CIC' | 'UPC';
  unitName: string;
  service?: string;
  assignedTo?: string;
  ipAddress?: string;
  status?: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  notes?: string;
}) {
  try {
    // Generate assetTag if not provided (e.g. IT-AST-2026-XXXX)
    let finalAssetTag = data.assetTag?.trim();
    if (!finalAssetTag) {
      const count = await prisma.iTAsset.count();
      finalAssetTag = `AST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    } else {
      // check uniqueness
      const existing = await prisma.iTAsset.findUnique({ where: { assetTag: finalAssetTag } });
      if (existing) {
        return { success: false, error: `Le code d'inventaire ${finalAssetTag} existe déjà.` };
      }
    }

    const newAsset = await prisma.iTAsset.create({
      data: {
        assetTag: finalAssetTag,
        name: data.name,
        type: data.type || 'DESKTOP',
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        unitType: data.unitType,
        unitName: data.unitName,
        service: data.service,
        assignedTo: data.assignedTo,
        ipAddress: data.ipAddress,
        status: data.status || 'OPERATIONAL',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        notes: data.notes,
      }
    });

    revalidatePath('/admin/assets');
    return { success: true, data: newAsset };
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de l\'équipement' };
  }
}

export async function updateAssetAction(id: string, data: Partial<{
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  unitType: 'FILIALE' | 'CIC' | 'UPC';
  unitName: string;
  service: string;
  assignedTo: string;
  ipAddress: string;
  status: string;
  notes: string;
}>) {
  try {
    const updated = await prisma.iTAsset.update({
      where: { id },
      data: {
        ...data,
      }
    });

    revalidatePath('/admin/assets');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating asset:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour' };
  }
}

export async function deleteAssetAction(id: string) {
  try {
    await prisma.iTAsset.delete({ where: { id } });
    revalidatePath('/admin/assets');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}

export async function getAssetDetailsAction(id: string) {
  try {
    const asset = await prisma.iTAsset.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            report: true,
            technician: true
          },
          orderBy: { createdAt: 'desc' }
        },
        dechargeItems: {
          include: {
            decharge: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) return { success: false, error: 'Équipement non trouvé' };

    return { success: true, data: asset };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
