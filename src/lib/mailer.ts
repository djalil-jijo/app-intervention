import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'localhost',
  port:   parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export const UNIT_TYPE_LABELS: Record<string, string> = {
  FILIALE: 'Filiale (Direction Régionale)',
  CIC:     'CIC (Direction de Wilaya)',
  UPC:     'UPC (Unité de Production)',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW:      'Basse',
  MEDIUM:   'Moyenne',
  URGENT:   'Urgente',
  CRITICAL: 'Haute / Critique',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  URGENT:   '#f97316',
  MEDIUM:   '#f59e0b',
  LOW:      '#3b82f6',
};

// ─────────────────────────────────────────────────────────────
// New Ticket notification (sent to IT admin)
// ─────────────────────────────────────────────────────────────
export async function sendNewTicketNotification(ticket: {
  ticketNumber: string;
  fullName:     string;
  service:      string;
  unitType:     string;
  unitName:     string;
  equipment:    string;
  priority:     string;
  description:  string;
}) {
  const adminEmail    = process.env.ADMIN_EMAIL || 'it-admin@enterprise.com';
  const unitTypeLabel = UNIT_TYPE_LABELS[ticket.unitType] || ticket.unitType;
  const priorityLabel = PRIORITY_LABELS[ticket.priority]  || ticket.priority;
  const priorityColor = PRIORITY_COLORS[ticket.priority]  || '#3b82f6';
  const appUrl        = process.env.APP_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 100%); padding: 24px 28px;">
        <p style="margin:0; font-size:11px; color:#7dd3fc; text-transform:uppercase; letter-spacing:1px; font-weight:600;">IT-TASKER ERP — Notification Automatique</p>
        <h2 style="margin:8px 0 0; font-size:20px; color:#ffffff;">🚨 Nouvelle Demande d'Intervention</h2>
      </div>

      <div style="padding: 24px 28px;">
        <p style="font-size:14px; line-height:1.6; color:#cbd5e1; margin:0 0 20px;">
          Un nouveau ticket d'assistance informatique a été enregistré dans le système.
        </p>

        <table style="width:100%; border-collapse:collapse; background:#1e293b; border-radius:8px; overflow:hidden; margin-bottom:20px;">
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px; width:38%;">N° Ticket</td>
            <td style="padding:11px 14px; font-weight:700; color:#38bdf8; font-size:13px; font-family:monospace;">${ticket.ticketNumber}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px;">Demandeur</td>
            <td style="padding:11px 14px; color:#f1f5f9; font-size:13px;">${ticket.fullName} — ${ticket.service}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px;">Entité</td>
            <td style="padding:11px 14px; color:#f1f5f9; font-size:13px;"><span style="background:#1e3a8a; color:#93c5fd; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600;">${unitTypeLabel}</span>&nbsp; ${ticket.unitName}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px;">Équipement</td>
            <td style="padding:11px 14px; color:#f1f5f9; font-size:13px;">${ticket.equipment}</td>
          </tr>
          <tr style="border-bottom:1px solid #334155;">
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px;">Priorité</td>
            <td style="padding:11px 14px;"><span style="background:${priorityColor}; color:#fff; padding:3px 10px; border-radius:4px; font-size:11px; font-weight:700;">${priorityLabel}</span></td>
          </tr>
          <tr>
            <td style="padding:11px 14px; font-weight:600; color:#94a3b8; font-size:12px; vertical-align:top;">Description</td>
            <td style="padding:11px 14px; color:#cbd5e1; font-size:12px; line-height:1.5; white-space:pre-wrap;">${ticket.description}</td>
          </tr>
        </table>

        <div style="text-align:center; margin-top:8px;">
          <a href="${appUrl}/admin/dashboard" style="background:linear-gradient(135deg,#0284c7,#4f46e5); color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; display:inline-block; letter-spacing:0.3px;">
            Accéder au Dashboard Admin →
          </a>
        </div>
      </div>

      <div style="padding:14px 28px; border-top:1px solid #1e293b; text-align:center; font-size:11px; color:#475569;">
        IT-Tasker ERP • Système de Gestion des Interventions IT Multi-Sites
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from:    process.env.SMTP_FROM || '"IT-Tasker Support" <support@enterprise.com>',
      to:      adminEmail,
      subject: `[IT-Tasker] NOUVEAU TICKET: ${ticket.ticketNumber} — ${ticket.equipment} (${ticket.unitName})`,
      html,
    });
    console.log(`[Email] Ticket notification sent for ${ticket.ticketNumber}:`, info.messageId);
  } catch (error) {
    console.error('[Email Error] Failed to send ticket notification:', error);
  }
}

// ─────────────────────────────────────────────────────────────
// Resolved Intervention Report email (with PDF attachment)
// ─────────────────────────────────────────────────────────────
export async function sendInterventionReportEmail(
  ticket: {
    ticketNumber: string;
    fullName:     string;
    service:      string;
    unitType:     string;
    unitName:     string;
    equipment:    string;
  },
  report: {
    reportNumber:   string;
    technicianName: string;
    diagnosis:      string;
    actionsTaken:   string;
    finalStatus:    string;
  },
  pdfBuffer: Buffer
) {
  const adminEmail    = process.env.ADMIN_EMAIL || 'it-admin@enterprise.com';
  const recipientTo   = ticket.service ? adminEmail : adminEmail; // Extend if per-user email needed

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 24px 28px;">
        <p style="margin:0; font-size:11px; color:#6ee7b7; text-transform:uppercase; letter-spacing:1px; font-weight:600;">IT-TASKER ERP — Rapport d'Intervention</p>
        <h2 style="margin:8px 0 0; font-size:20px; color:#ffffff;">✅ Ticket Résolu & Clôturé</h2>
      </div>

      <div style="padding: 24px 28px;">
        <p style="font-size:14px; line-height:1.6; color:#cbd5e1; margin:0 0 20px;">
          La demande d'intervention informatique a été traitée et résolue par le support IT. La fiche officielle est disponible en pièce jointe.
        </p>

        <div style="background:#1e293b; border-radius:8px; padding:16px 18px; margin-bottom:20px;">
          <p style="margin:0 0 8px;"><span style="color:#94a3b8; font-size:12px;">Fiche N° :</span> <strong style="color:#34d399; font-family:monospace;">${report.reportNumber}</strong></p>
          <p style="margin:0 0 8px;"><span style="color:#94a3b8; font-size:12px;">Ticket :</span> <span style="color:#38bdf8; font-family:monospace;">${ticket.ticketNumber}</span></p>
          <p style="margin:0 0 8px;"><span style="color:#94a3b8; font-size:12px;">Demandeur :</span> <span style="color:#f1f5f9;">${ticket.fullName} (${ticket.service})</span></p>
          <p style="margin:0 0 8px;"><span style="color:#94a3b8; font-size:12px;">Entité :</span> <span style="color:#f1f5f9;">${UNIT_TYPE_LABELS[ticket.unitType] || ticket.unitType} — ${ticket.unitName}</span></p>
          <p style="margin:0 0 8px;"><span style="color:#94a3b8; font-size:12px;">Technicien :</span> <span style="color:#f1f5f9;">${report.technicianName}</span></p>
          <p style="margin:0;"><span style="color:#94a3b8; font-size:12px;">Statut Final :</span> <span style="color:#34d399; font-weight:700;">${report.finalStatus}</span></p>
        </div>

        <p style="color:#94a3b8; font-size:13px; line-height:1.5;">
          📎 La fiche d'intervention officielle au format PDF est jointe à cet email.
        </p>
      </div>

      <div style="padding:14px 28px; border-top:1px solid #1e293b; text-align:center; font-size:11px; color:#475569;">
        IT-Tasker ERP • Document officiel généré automatiquement — Ne pas répondre
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from:    process.env.SMTP_FROM || '"IT-Tasker Support" <support@enterprise.com>',
      to:      recipientTo,
      subject: `[IT-Tasker] FICHE D'INTERVENTION ${report.reportNumber} — Ticket ${ticket.ticketNumber} RÉSOLU`,
      html,
      attachments: [
        {
          filename:    `Fiche_Intervention_${report.reportNumber}.pdf`,
          content:     pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log(`[Email] Report PDF sent for ${report.reportNumber}:`, info.messageId);
  } catch (error) {
    console.error('[Email Error] Failed to send intervention report email:', error);
  }
}
