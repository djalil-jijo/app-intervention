import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
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
    borderBottomColor: '#0EA5E9',
    paddingBottom: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  badgeCompany: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0369A1',
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
    fontSize: 18,
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
  ticketNumberLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  ticketNumberVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginTop: 1,
  },
  ticketDateVal: {
    fontSize: 8,
    color: '#475569',
    marginTop: 3,
  },

  // Section Styles
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 4,
    marginBottom: 10,
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
    marginBottom: 6,
  },
  col12: {
    width: '100%',
    paddingHorizontal: 3,
    marginBottom: 6,
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
    paddingVertical: 6,
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
    color: '#0EA5E9',
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
    padding: 10,
    marginTop: 4,
    minHeight: 120,
  },
  textBoxTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textBoxContent: {
    fontSize: 9.5,
    color: '#1E293B',
    lineHeight: 1.5,
  },

  // Signatures Section
  signatureSection: {
    marginTop: 20,
    paddingTop: 10,
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

interface InterventionTicketPDFProps {
  ticket: {
    ticketNumber: string;
    fullName: string;
    functionTitle?: string | null;
    service: string;
    unitType: string;
    unitName: string;
    phone?: string | null;
    email?: string | null;
    managerName?: string | null;
    equipment: string;
    ipAddress?: string | null;
    serialNumber?: string | null;
    priority: string;
    description: string;
    status: string;
    createdAt: Date | string;
  };
}

const unitTypeMap: Record<string, string> = {
  FILIALE: 'Filiale (Dir. Régionale)',
  CIC:     'CIC (Dir. Wilaya)',
  UPC:     'UPC (Unité Prod.)',
};

const priorityMap: Record<string, string> = {
  LOW:      'Basse',
  MEDIUM:   'Moyenne',
  URGENT:   'Urgente',
  CRITICAL: 'Haute / Critique',
};

export const InterventionTicketPDF: React.FC<InterventionTicketPDFProps> = ({ ticket }) => {
  const formattedTicketDate = new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const unitDisplay = `${unitTypeMap[ticket.unitType] || ticket.unitType} - ${ticket.unitName}`;

  return (
    <Document title={`Demande_Intervention_${ticket.ticketNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeCompany}>IT-TASKER ERP SUPPORT SYSTEM</Text>
            <Text style={styles.docMainTitle}>DEMANDE D&apos;INTERVENTION IT</Text>
            <Text style={styles.docSubTitle}>
              Fiche officielle de demande de dépannage informatique
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.ticketNumberLabel}>N° Demande</Text>
            <Text style={styles.ticketNumberVal}>{ticket.ticketNumber}</Text>
            <Text style={styles.ticketDateVal}>Date : {formattedTicketDate}</Text>
          </View>
        </View>

        {/* Section 1: Informations du Demandeur */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>1. IDENTIFICATION DU DEMANDEUR & STRUCTURE</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Nom & Prénom :</Text>
                <Text style={styles.fieldValueHighlight}>{ticket.fullName}</Text>
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
                <Text style={styles.fieldLabel}>Téléphone :</Text>
                <Text style={styles.fieldValue}>{ticket.phone || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Email :</Text>
                <Text style={styles.fieldValue}>{ticket.email || 'N/A'}</Text>
              </View>
            </View>

            {ticket.managerName ? (
              <View style={styles.col12}>
                <View style={styles.fieldCard}>
                  <Text style={{ ...styles.fieldLabel, width: '19%' }}>Responsable :</Text>
                  <Text style={{ ...styles.fieldValue, width: '81%' }}>{ticket.managerName}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Section 2: Équipement & Degré d'Urgence */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>2. DÉTAILS ÉQUIPEMENT & DÉCLARATION INCIDENT</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Équipement :</Text>
                <Text style={styles.fieldValue}>{ticket.equipment}</Text>
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
                <Text style={styles.fieldLabel}>Adresse IP :</Text>
                <Text style={styles.fieldValue}>{ticket.ipAddress || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>N° Série :</Text>
                <Text style={styles.fieldValue}>{ticket.serialNumber || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.textBoxContainer}>
            <Text style={styles.textBoxTitle}>Description détaillée du dysfonctionnement / panne :</Text>
            <Text style={styles.textBoxContent}>{ticket.description}</Text>
          </View>
        </View>

        {/* Section 3: Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Signature du Demandeur</Text>
              <Text style={styles.signatureSub}>Nom: {ticket.fullName}</Text>
              <Text style={styles.signatureFooterText}>Date & Emargement demandeur</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Réception Support IT</Text>
              <Text style={styles.signatureSub}>Prise en charge IT</Text>
              <Text style={styles.signatureFooterText}>Date & Tampon Réception</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>IT-Tasker ERP Multi-Site Ticket System</Text>
          <Text>Fiche de Demande d&apos;Intervention - Page 1 sur 1</Text>
        </View>
      </Page>
    </Document>
  );
};
