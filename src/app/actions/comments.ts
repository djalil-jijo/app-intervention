'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function getTicketCommentsAction(ticketId: string) {
  try {
    const comments = await prisma.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: comments };
  } catch (error: any) {
    console.error('[getTicketCommentsAction]', error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function addTicketCommentAction(input: {
  ticketId: string;
  author: string;
  content: string;
  isSystem?: boolean;
}) {
  try {
    if (!input.content || input.content.trim() === '') {
      return { success: false, error: 'المحتوى لا يمكن أن يكون فارغاً' };
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: input.ticketId,
        author: input.author || 'التقني المكلف',
        content: input.content.trim(),
        isSystem: input.isSystem || false,
      },
    });

    revalidatePath('/admin/tickets');
    return { success: true, data: comment };
  } catch (error: any) {
    console.error('[addTicketCommentAction]', error);
    return { success: false, error: error.message };
  }
}
