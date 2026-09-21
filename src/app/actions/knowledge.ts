'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getArticlesAction(params?: { search?: string; category?: string }) {
  try {
    const where: any = {};

    if (params?.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params?.search && params.search.trim() !== '') {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { problem: { contains: q, mode: 'insensitive' } },
        { solution: { contains: q, mode: 'insensitive' } },
        { tags: { contains: q, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: articles };
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return { success: false, error: error.message || 'Erreur lors du chargement des articles' };
  }
}

export async function createArticleAction(data: {
  title: string;
  category: string;
  problem: string;
  solution: string;
  tags?: string;
  author?: string;
}) {
  try {
    const article = await prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        category: data.category || 'Général',
        problem: data.problem,
        solution: data.solution,
        tags: data.tags,
        author: data.author || 'Équipe IT'
      }
    });

    revalidatePath('/admin/knowledge');
    return { success: true, data: article };
  } catch (error: any) {
    console.error('Error creating article:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de l\'article' };
  }
}

export async function incrementArticleViewsAction(id: string) {
  try {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await prisma.knowledgeArticle.delete({ where: { id } });
    revalidatePath('/admin/knowledge');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
