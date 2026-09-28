'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getTechniciansAction() {
  try {
    const technicians = await prisma.technician.findMany({
      orderBy: { name: 'asc' },
      include: {
        tickets: {
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
          }
        }
      }
    });

    const formatted = technicians.map(tech => {
      const activeTickets = tech.tickets.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
      const resolvedTickets = tech.tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      return {
        ...tech,
        activeTickets,
        resolvedTickets,
        totalTickets: tech.tickets.length
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error fetching technicians:', error);
    return { success: false, error: error.message || 'Erreur lors du chargement des techniciens' };
  }
}

export async function createTechnicianAction(data: {
  name: string;
  email: string;
  phone?: string;
  speciality?: string | string[];
  role?: string;
  username?: string;
  password?: string;
  signature?: string;
  stamp?: string;
}) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await prisma.technician.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return { success: false, error: 'Un membre avec cet email existe déjà.' };
    }

    let finalSpeciality = Array.isArray(data.speciality)
      ? data.speciality.join(', ')
      : (data.speciality || 'Généraliste');

    if (finalSpeciality.length > 490) {
      finalSpeciality = finalSpeciality.substring(0, 487) + '...';
    }

    const finalRole = (data.role || 'Technicien en Informatique').substring(0, 95);
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    const cleanUsername = data.username ? data.username.trim().toLowerCase() : null;

    const tech = await prisma.technician.create({
      data: {
        name: data.name.trim(),
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        phone: data.phone ? data.phone.trim() : null,
        speciality: finalSpeciality,
        role: finalRole,
        signature: data.signature || null,
        stamp: data.stamp || null,
        active: true
      }
    });

    revalidatePath('/admin/technicians');
    return { success: true, data: tech };
  } catch (error: any) {
    console.error('Error creating technician:', error);
    return { success: false, error: error.message || 'Erreur lors de la création du profil' };
  }
}

export async function updateTechnicianAction(id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  speciality?: string | string[];
  role?: string;
  username?: string;
  password?: string;
  signature?: string | null;
  stamp?: string | null;
  active?: boolean;
}) {
  try {
    const finalSpeciality = Array.isArray(data.speciality)
      ? data.speciality.join(', ')
      : data.speciality;

    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.email) updateData.email = data.email.trim().toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (finalSpeciality) updateData.speciality = finalSpeciality;
    if (data.role) updateData.role = data.role;
    if (data.username !== undefined) updateData.username = data.username?.trim().toLowerCase() || null;
    if (data.signature !== undefined) updateData.signature = data.signature;
    if (data.stamp !== undefined) updateData.stamp = data.stamp;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.password && data.password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(data.password.trim(), 10);
    }

    const updated = await prisma.technician.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/admin/technicians');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating technician:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour' };
  }
}

export async function deleteTechnicianAction(id: string) {
  try {
    await prisma.technician.delete({ where: { id } });
    revalidatePath('/admin/technicians');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting technician:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}

export async function assignTicketTechnicianAction(ticketId: string, technicianId: string) {
  try {
    const ticket = await prisma.interventionTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { success: false, error: 'Ticket introuvable' };

    const newStatus = ticket.status === 'PENDING' ? 'IN_PROGRESS' : ticket.status;

    await prisma.interventionTicket.update({
      where: { id: ticketId },
      data: {
        technicianId: technicianId || null,
        status: newStatus
      }
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning technician:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'affectation' };
  }
}
