import { z } from 'zod';

export const UnitTypeEnum = z.enum(['FILIALE', 'CIC', 'UPC']);
export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'URGENT', 'CRITICAL']);
export const TicketStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const UNIT_TYPE_LABELS: Record<string, string> = {
  FILIALE: 'Filiale (Direction Régionale)',
  CIC:     'CIC (Direction de Wilaya)',
  UPC:     'UPC (Unité de Production)',
};

export const UNIT_TYPE_SHORT: Record<string, string> = {
  FILIALE: 'Filiale',
  CIC:     'CIC',
  UPC:     'UPC',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW:      'Basse',
  MEDIUM:   'Moyenne',
  URGENT:   'Urgente',
  CRITICAL: 'Haute / Critique',
};

export const TICKET_CATEGORIES = [
  'Matériel informatique (PC, imprimante...)',
  'Réseau & Télécom (LAN/WAN, Wifi...)',
  'Serveur / Infrastructure',
  'Logiciel / ERP',
  'GED (Gestion Électronique des Documents)',
  'Sécurité / Accès / Compte utilisateur',
  'Messagerie / Communication',
  'Autre',
] as const;

export const createTicketSchema = z.object({
  fullName:      z.string().min(2, 'Le nom complet est requis'),
  functionTitle: z.string().optional().or(z.literal('')),
  service:       z.string().min(2, 'Le service/département est requis'),
  phone:         z.string().optional().or(z.literal('')),
  email:         z.string().email('Adresse email invalide').optional().or(z.literal('')),
  managerName:   z.string().optional().or(z.literal('')),

  unitType: UnitTypeEnum,
  unitName: z.string().min(2, "Le nom de l'unité / entité est requis"),

  category:     z.string().default('Matériel informatique (PC, imprimante...)'),
  equipment:    z.string().min(2, "La désignation de l'équipement est requise"),
  ipAddress:    z.string().optional().or(z.literal('')),
  serialNumber: z.string().optional().or(z.literal('')),
  priority:     PriorityEnum,
  description:  z.string().min(5, 'La description détaillée du problème est requise'),
});

export const createReportSchema = z.object({
  ticketId:      z.string().min(1, 'ID Ticket est requis'),
  technicianName: z.string().min(2, 'Le nom du technicien est requis'),
  diagnosis:     z.string().min(5, 'Le diagnostic technique est requis'),
  actionsTaken:  z.string().min(5, 'Les actions réalisées sont requises'),
  partsReplaced: z.string().optional().or(z.literal('')),
  finalStatus:   z.string().min(2, 'Le statut final est requis'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
