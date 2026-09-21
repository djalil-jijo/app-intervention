'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CreateDechargeItemInput {
  assetId?: string;
  assetTag?: string;
  equipmentName: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition?: string;
  accessories?: string;
}

export interface CreateDechargeInput {
  beneficiaryName: string;
  functionTitle?: string;
  department: string;
  matricule?: string;
  phone?: string;
  email?: string;
  unitType: 'FILIALE' | 'CIC' | 'UPC';
  unitName: string;
  dischargeType: 'PERMANENT' | 'TEMPORARY';
  dischargeDate?: string;
  expectedReturnDate?: string;
  technicianName: string;
  notes?: string;
  items: CreateDechargeItemInput[];
}

export async function getDechargesAction(params?: {
  search?: string;
  status?: string;
  unitType?: string;
  dischargeType?: string;
}) {
  try {
    const where: any = {};

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.unitType && params.unitType !== 'ALL') {
      where.unitType = params.unitType;
    }

    if (params?.dischargeType && params.dischargeType !== 'ALL') {
      where.dischargeType = params.dischargeType;
    }

    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim();
      where.OR = [
        { dechargeNumber: { contains: q, mode: 'insensitive' } },
        { beneficiaryName: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { matricule: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { technicianName: { contains: q, mode: 'insensitive' } },
        { unitName: { contains: q, mode: 'insensitive' } },
        {
          items: {
            some: {
              OR: [
                { equipmentName: { contains: q, mode: 'insensitive' } },
                { serialNumber: { contains: q, mode: 'insensitive' } },
                { assetTag: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const decharges = await prisma.equipmentDecharge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        _count: {
          select: { items: true },
        },
      },
    });

    return { success: true, data: decharges };
  } catch (error: any) {
    console.error('Error fetching decharges:', error);
    return { success: false, error: error.message || 'Erreur lors du chargement des décharges' };
  }
}

export async function getDechargeDetailsAction(id: string) {
  try {
    const decharge = await prisma.equipmentDecharge.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: true,
          },
        },
      },
    });

    if (!decharge) {
      return { success: false, error: 'Bon de décharge introuvable' };
    }

    return { success: true, data: decharge };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDechargeAction(input: CreateDechargeInput) {
  try {
    if (!input.beneficiaryName || input.beneficiaryName.trim() === '') {
      return { success: false, error: 'Le nom du bénéficiaire est obligatoire' };
    }
    if (!input.department || input.department.trim() === '') {
      return { success: false, error: 'Le service / département est obligatoire' };
    }
    if (!input.technicianName || input.technicianName.trim() === '') {
      return { success: false, error: 'Le nom du technicien responsable est obligatoire' };
    }
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Veuillez ajouter au moins un équipement à la décharge' };
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.equipmentDecharge.count({
      where: {
        dechargeNumber: {
          startsWith: `DCH-${currentYear}-`,
        },
      },
    });

    const dechargeNumber = `DCH-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const newDecharge = await prisma.$transaction(async (tx) => {
      const created = await tx.equipmentDecharge.create({
        data: {
          dechargeNumber,
          beneficiaryName: input.beneficiaryName.trim(),
          functionTitle: input.functionTitle?.trim() || null,
          department: input.department.trim(),
          matricule: input.matricule?.trim() || null,
          phone: input.phone?.trim() || null,
          email: input.email?.trim() || null,
          unitType: input.unitType || 'FILIALE',
          unitName: input.unitName || 'Direction Générale Alger',
          dischargeType: input.dischargeType || 'PERMANENT',
          dischargeDate: input.dischargeDate ? new Date(input.dischargeDate) : new Date(),
          expectedReturnDate: input.expectedReturnDate ? new Date(input.expectedReturnDate) : null,
          technicianName: input.technicianName.trim(),
          notes: input.notes?.trim() || null,
          status: 'ACTIVE',
          items: {
            create: input.items.map((it) => ({
              assetId: it.assetId || null,
              assetTag: it.assetTag?.trim() || null,
              equipmentName: it.equipmentName.trim(),
              category: it.category || 'DESKTOP',
              brand: it.brand?.trim() || null,
              model: it.model?.trim() || null,
              serialNumber: it.serialNumber?.trim() || null,
              condition: it.condition || 'BON_ETAT',
              accessories: it.accessories?.trim() || null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update ITAsset assignedTo if assetId is provided
      for (const it of input.items) {
        if (it.assetId) {
          await tx.iTAsset.update({
            where: { id: it.assetId },
            data: {
              assignedTo: input.beneficiaryName.trim(),
              service: input.department.trim(),
              unitType: input.unitType || 'FILIALE',
              unitName: input.unitName || 'Direction Générale Alger',
              status: 'OPERATIONAL',
            },
          });
        }
      }

      return created;
    });

    revalidatePath('/admin/decharges');
    revalidatePath('/admin/assets');
    return { success: true, data: newDecharge };
  } catch (error: any) {
    console.error('Error creating decharge:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la décharge' };
  }
}

export async function returnDechargeAction(id: string, returnNotes?: string) {
  try {
    const decharge = await prisma.equipmentDecharge.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!decharge) {
      return { success: false, error: 'Décharge introuvable' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.equipmentDecharge.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnNotes: returnNotes?.trim() || 'Matériel restitué au service informatique.',
        },
      });

      // Free assets in inventory
      for (const item of decharge.items) {
        if (item.assetId) {
          await tx.iTAsset.update({
            where: { id: item.assetId },
            data: {
              assignedTo: null,
            },
          });
        }
      }
    });

    revalidatePath('/admin/decharges');
    revalidatePath('/admin/assets');
    return { success: true };
  } catch (error: any) {
    console.error('Error returning decharge:', error);
    return { success: false, error: error.message || 'Erreur lors de la restitution' };
  }
}

export async function deleteDechargeAction(id: string) {
  try {
    await prisma.equipmentDecharge.delete({
      where: { id },
    });

    revalidatePath('/admin/decharges');
    revalidatePath('/admin/assets');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting decharge:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}
