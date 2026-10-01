import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#1E293B',
  },

  // Header section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderBottomWidth: 2,
    borderBottomColor: '#0284C7',
    paddingBottom: 10,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  badgeCompany: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docMainTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  docSubTitle: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    minWidth: 150,
  },
  reportNumberLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  reportNumberVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0284C7',
    marginTop: 1,
  },
  reportDateVal: {
    fontSize: 8,
    color: '#475569',
    marginTop: 3,
  },

  // Section Styles
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Grid system
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  col6: {
    width: '50%',
    paddingHorizontal: 3,
    marginBottom: 5,
  },
  col12: {
    width: '100%',
    paddingHorizontal: 3,
    marginBottom: 5,
  },

  // Fields inside card
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: '#64748B',
    width: '38%',
    fontSize: 8.5,
  },
  fieldValue: {
    color: '#0F172A',
    width: '62%',
    fontSize: 9,
    fontWeight: 'bold',
  },
  fieldValueHighlight: {
    color: '#0284C7',
    width: '62%',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Text boxes
  textBoxContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 8,
    marginTop: 3,
  },
  textBoxTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textBoxContent: {
    fontSize: 9,
    color: '#1E293B',
    lineHeight: 1.45,
  },

  // Status Badge
  statusPillResolved: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#047857',
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  // Signatures Section
  signatureSection: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  signatureBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    height: 100,
    backgroundColor: '#FAFDFD',
    position: 'relative',
  },
  signatureHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 4,
  },
  signatureSub: {
    fontSize: 7.5,
    color: '#94A3B8',
  },
  signatureFooterText: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 10,
    fontSize: 7.5,
    color: '#94A3B8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#94A3B8',
  },
});

interface InterventionReportPDFProps {
  ticket: {
    ticketNumber: string;
    fullName: string;
    service: string;
    unitType: string;
    unitName: string;
    equipment: string;
    ipAddress?: string | null;
    serialNumber?: string | null;
    priority: string;
    description: string;
    createdAt: Date | string;
    employeeSignature?: string | null;
    employeeStamp?: string | null;
  };
  report: {
    reportNumber: string;
    technicianName: string;
    diagnosis: string;
    actionsTaken: string;
    partsReplaced?: string | null;
    finalStatus: string;
    completedAt: Date | string;
    technicianSignature?: string | null;
    technicianStamp?: string | null;
    clientSignature?: string | null;
  };
}

const unitTypeMap: Record<string, string> = {
  FILIALE: 'Filiale (Dir. Régionale)',
  CIC: 'CIC (Dir. Wilaya)',
  UPC: 'UPC (Unité Prod.)',
};

const priorityMap: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  URGENT: 'Urgente',
  CRITICAL: 'Haute / Critique',
};

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({
  ticket,
  report,
}) => {
  const formattedTicketDate = new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedReportDate = new Date(report.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const unitDisplay = `${unitTypeMap[ticket.unitType] || ticket.unitType} - ${ticket.unitName}`;

  return (
    <Document title={`Fiche_Intervention_${report.reportNumber}_${ticket.ticketNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeCompany}>IT-TASKER ERP SUPPORT SYSTEM</Text>
            <Text style={styles.docMainTitle}>FICHE D&apos;INTERVENTION TECHNIQUE</Text>
            <Text style={styles.docSubTitle}>
              Document officiel d&apos;intervention & de clôture de ticket informatique
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.reportNumberLabel}>N° Fiche Intervention</Text>
            <Text style={styles.reportNumberVal}>{report.reportNumber}</Text>
            <Text style={styles.reportDateVal}>Clôturé le : {formattedReportDate}</Text>
          </View>
        </View>

        {/* Section 1: Demandeur & Equipement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>1. INFORMATIONS DEMANDEUR & ÉQUIPEMENT</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Ticket N° :</Text>
                <Text style={styles.fieldValueHighlight}>{ticket.ticketNumber}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Date Demande :</Text>
                <Text style={styles.fieldValue}>{formattedTicketDate}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Nom & Prénom :</Text>
                <Text style={styles.fieldValue}>{ticket.fullName}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Service / DSI :</Text>
                <Text style={styles.fieldValue}>{ticket.service}</Text>
              </View>
            </View>

            <View style={styles.col12}>
              <View style={styles.fieldCard}>
                <Text style={{ ...styles.fieldLabel, width: '19%' }}>Entité / Structure :</Text>
                <Text style={{ ...styles.fieldValue, width: '81%' }}>{unitDisplay}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Priorité :</Text>
                <Text style={styles.fieldValue}>{priorityMap[ticket.priority] || ticket.priority}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Équipement :</Text>
                <Text style={styles.fieldValue}>{ticket.equipment}</Text>
              </View>
            </View>

            <View style={styles.col12}>
              <View style={styles.fieldCard}>
                <Text style={{ ...styles.fieldLabel, width: '19%' }}>N° Série / IP :</Text>
                <Text style={{ ...styles.fieldValue, width: '81%' }}>
                  {ticket.serialNumber || 'N/A'} {ticket.ipAddress ? `(${ticket.ipAddress})` : ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.textBoxContainer}>
            <Text style={styles.textBoxTitle}>Description du problème déclaré par l&apos;utilisateur :</Text>
            <Text style={styles.textBoxContent}>{ticket.description}</Text>
          </View>
        </View>

        {/* Section 2: Rapport Technique */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>2. DIAGNOSTIC & DÉROULEMENT DE L&apos;INTERVENTION</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Technicien IT :</Text>
                <Text style={styles.fieldValue}>{report.technicianName}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Résultat Final :</Text>
                <Text style={styles.statusPillResolved}>{report.finalStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.textBoxContainer}>
            <Text style={styles.textBoxTitle}>Diagnostic & Cause Racines Identifiées :</Text>
            <Text style={styles.textBoxContent}>{report.diagnosis}</Text>
          </View>

          <View style={styles.textBoxContainer}>
            <Text style={styles.textBoxTitle}>Actions Correctives & Interventions Effectuées :</Text>
            <Text style={styles.textBoxContent}>{report.actionsTaken}</Text>
          </View>

          {report.partsReplaced ? (
            <View style={styles.textBoxContainer}>
              <Text style={styles.textBoxTitle}>Pièces & Équipements Remplacés :</Text>
              <Text style={styles.textBoxContent}>{report.partsReplaced}</Text>
            </View>
          ) : null}
        </View>

        {/* Section 3: Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Signature &amp; Cachet Technicien IT</Text>
              <Text style={styles.signatureSub}>Technicien: {report.technicianName}</Text>
              <View style={{ position: 'absolute', top: 28, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around' }}>
                {report.technicianSignature ? (
                  <Image src={report.technicianSignature} style={{ maxWidth: 160, maxHeight: 100, objectFit: 'contain' }} />
                ) : null}
                {report.technicianStamp ? (
                  <Image src={report.technicianStamp} style={{ width: 220, height: 220, objectFit: 'contain' }} />
                ) : null}
              </View>
              <Text style={styles.signatureFooterText}>Date &amp; Cachet du service IT</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Bon pour accord / Client Demandeur</Text>
              <Text style={styles.signatureSub}>Nom: {ticket.fullName}</Text>
              <View style={{ position: 'absolute', top: 28, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around' }}>
                {report.clientSignature || ticket.employeeSignature ? (
                  <Image src={report.clientSignature || ticket.employeeSignature!} style={{ maxWidth: 160, maxHeight: 100, objectFit: 'contain' }} />
                ) : null}
                {ticket.employeeStamp ? (
                  <Image src={ticket.employeeStamp} style={{ width: 220, height: 220, objectFit: 'contain' }} />
                ) : null}
              </View>
              <Text style={styles.signatureFooterText}>Signature &amp; Validation du demandeur</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>IT-Tasker ERP Multi-Site Ticket & Report System</Text>
          <Text>Rapport Officiel Certifié - Page 1 sur 1</Text>
        </View>
      </Page>
    </Document>
  );
};
