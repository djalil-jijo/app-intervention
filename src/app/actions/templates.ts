'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Priority } from '@prisma/client';

export async function getTemplatesAction() {
  try {
    const templates = await prisma.interventionTemplate.findMany({
      orderBy: { usageCount: 'desc' },
    });
    return { success: true, data: templates };
  } catch (error: any) {
    console.error('[getTemplatesAction]', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createTemplateAction(input: {
  name: string;
  category: string;
  equipment: string;
  description: string;
  priority?: Priority;
  solution?: string;
}) {
  try {
    const template = await prisma.interventionTemplate.create({
      data: {
        name: input.name,
        category: input.category,
        equipment: input.equipment,
        description: input.description,
        priority: input.priority || Priority.MEDIUM,
        solution: input.solution || null,
      },
    });

    revalidatePath('/admin/templates');
    return { success: true, data: template };
  } catch (error: any) {
    console.error('[createTemplateAction]', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplateAction(id: string) {
  try {
    await prisma.interventionTemplate.delete({ where: { id } });
    revalidatePath('/admin/templates');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteTemplateAction]', error);
    return { success: false, error: error.message };
  }
}
