'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
}) {
  try {
    const existing = await prisma.technician.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: 'Un membre avec cet email existe déjà.' };
    }

    let finalSpeciality = Array.isArray(data.speciality)
      ? data.speciality.join(', ')
      : (data.speciality || 'Généraliste');

    // Safe truncation if column in PostgreSQL database is still limited
    if (finalSpeciality.length > 490) {
      finalSpeciality = finalSpeciality.substring(0, 487) + '...';
    }

    const finalRole = (data.role || 'Technicien en Informatique').substring(0, 95);

    const tech = await prisma.technician.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone ? data.phone.trim() : null,
        speciality: finalSpeciality,
        role: finalRole,
        active: true
      }
    });

    revalidatePath('/admin/technicians');
    return { success: true, data: tech };
  } catch (error: any) {
    console.error('Error creating technician:', error);
    if (error?.code === 'P2000') {
      return { 
        success: false, 
        error: 'النص المدخل في التخصص أو الصفة يتجاوز السعة المسموحة في قاعدة البيانات. يرجى تنفيذ أمر ALTER TABLE لتوسيع الحقل أو اختيار تخصصات أقل.' 
      };
    }
    return { success: false, error: error.message || 'Erreur lors de la création du profil' };
  }
}

export async function updateTechnicianAction(id: string, data: {
  name?: string;
  email?: string;
  phone?: string;
  speciality?: string | string[];
  role?: string;
}) {
  try {
    const finalSpeciality = Array.isArray(data.speciality)
      ? data.speciality.join(', ')
      : data.speciality;

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(finalSpeciality && { speciality: finalSpeciality }),
        ...(data.role && { role: data.role }),
      }
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
