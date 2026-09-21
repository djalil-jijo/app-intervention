import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1E293B',
  },

  // Header section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5', // Indigo primary
    paddingBottom: 10,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 10,
  },
  badgeCompany: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docMainTitle: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0,
  },
  docSubTitle: {
    fontSize: 8,
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
    padding: 6,
    minWidth: 135,
  },
  dechargeNumberLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  dechargeNumberVal: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 1,
  },
  dechargeDateVal: {
    fontSize: 7.5,
    color: '#475569',
    marginTop: 2,
  },
  badgeType: {
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  sectionTitleText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  col6: {
    width: '50%',
    paddingHorizontal: 3,
    marginBottom: 4,
  },
  col4: {
    width: '33.33%',
    paddingHorizontal: 3,
    marginBottom: 4,
  },

  // Field Cards
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4.5,
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: '#64748B',
    width: '40%',
    fontSize: 8,
  },
  fieldValue: {
    color: '#0F172A',
    width: '60%',
    fontSize: 8.5,
    fontWeight: 'bold',
  },

  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 2,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4.5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4.5,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4.5,
    paddingHorizontal: 4,
    backgroundColor: '#F8FAFC',
  },
  th: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 8,
    color: '#1E293B',
  },
  tdBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Commitment Clauses
  clauseBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 7,
    marginTop: 2,
  },
  clauseTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  clauseText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.35,
    marginBottom: 2.5,
  },

  // Signatures
  signatureSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  signatureBox: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 5,
    padding: 7,
    height: 90,
    backgroundColor: '#FAFDFD',
  },
  signatureHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 3,
    marginBottom: 3,
    textAlign: 'center',
  },
  signatureSub: {
    fontSize: 7,
    color: '#64748B',
    textAlign: 'center',
  },
  signatureFooterText: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    right: 6,
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 7,
    color: '#94A3B8',
  },
});

interface DechargePDFProps {
  decharge: {
    dechargeNumber: string;
    beneficiaryName: string;
    functionTitle?: string | null;
    department: string;
    matricule?: string | null;
    phone?: string | null;
    email?: string | null;
    unitType: string;
    unitName: string;
    dischargeType: string;
    dischargeDate: Date | string;
    expectedReturnDate?: Date | string | null;
    technicianName: string;
    notes?: string | null;
    status: string;
    returnedAt?: Date | string | null;
    returnNotes?: string | null;
    items?: Array<{
      assetTag?: string | null;
      equipmentName: string;
      category: string;
      brand?: string | null;
      model?: string | null;
      serialNumber?: string | null;
      condition: string;
      accessories?: string | null;
    }>;
  };
}

const unitTypeLabel: Record<string, string> = {
  FILIALE: 'Direction Régionale (Filiale)',
  CIC: 'Direction de Wilaya (CIC)',
  UPC: 'Unité de Production (UPC)',
};

const conditionLabel: Record<string, string> = {
  NEUF: 'Neuf',
  BON_ETAT: 'Bon état',
  ETAT_MOYEN: 'État moyen',
};

export const DechargeReportPDF: React.FC<DechargePDFProps> = ({ decharge }) => {
  const formattedDate = new Date(decharge.dischargeDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedReturnDate = decharge.expectedReturnDate
    ? new Date(decharge.expectedReturnDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  const isTemporary = decharge.dischargeType === 'TEMPORARY';

  return (
    <Document title={`Bon_Decharge_${decharge.dechargeNumber}.pdf`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeCompany}>Direction des Systèmes d&apos;Information</Text>
            <Text style={styles.docMainTitle}>BON DE DÉCHARGE DE MATÉRIEL INFORMATIQUE</Text>
            <Text style={styles.docSubTitle}>Procès-verbal de remise et décharge de responsabilité de matériel IT</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dechargeNumberLabel}>RÉFÉRENCE DÉCHARGE</Text>
            <Text style={styles.dechargeNumberVal}>{decharge.dechargeNumber}</Text>
            <Text style={styles.dechargeDateVal}>Date : {formattedDate}</Text>
            <Text
              style={[
                styles.badgeType,
                isTemporary
                  ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                  : { backgroundColor: '#ECFDF5', color: '#065F46' },
              ]}
            >
              {isTemporary ? `PRÊT TEMPORAIRE (Retour : ${formattedReturnDate || 'N/A'})` : 'AFFECTATION DÉFINITIVE'}
            </Text>
          </View>
        </View>

        {/* Section 1: Bénéficiaire */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>1. IDENTIFICATION DU BÉNÉFICIAIRE</Text>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Nom & Prénom :</Text>
                <Text style={styles.fieldValue}>{decharge.beneficiaryName}</Text>
              </View>
            </View>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Fonction :</Text>
                <Text style={styles.fieldValue}>{decharge.functionTitle || '—'}</Text>
              </View>
            </View>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Service / Dir. :</Text>
                <Text style={styles.fieldValue}>{decharge.department}</Text>
              </View>
            </View>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Matricule / CIN :</Text>
                <Text style={styles.fieldValue}>{decharge.matricule || '—'}</Text>
              </View>
            </View>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Site & Structure :</Text>
                <Text style={styles.fieldValue}>
                  {decharge.unitName} ({unitTypeLabel[decharge.unitType] || decharge.unitType})
                </Text>
              </View>
            </View>
            <View style={styles.col6}>
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Contact :</Text>
                <Text style={styles.fieldValue}>{decharge.phone || decharge.email || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Matériel Remis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>2. DÉTAIL DU MATÉRIEL REMIS</Text>
          </View>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.th, { width: '5%', textAlign: 'center' }]}>N°</Text>
              <Text style={[styles.th, { width: '28%' }]}>Désignation</Text>
              <Text style={[styles.th, { width: '18%' }]}>Marque / Modèle</Text>
              <Text style={[styles.th, { width: '18%' }]}>N° Série (S/N)</Text>
              <Text style={[styles.th, { width: '13%' }]}>N° Inventaire</Text>
              <Text style={[styles.th, { width: '18%' }]}>Accessoires / État</Text>
            </View>

            {/* Table Rows */}
            {decharge.items && decharge.items.length > 0 ? (
              decharge.items.map((item, idx) => (
                <View key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
                  <Text style={[styles.td, { width: '5%', textAlign: 'center' }]}>{idx + 1}</Text>
                  <View style={{ width: '28%' }}>
                    <Text style={styles.tdBold}>{item.equipmentName}</Text>
                    <Text style={{ fontSize: 7, color: '#64748B' }}>Cat: {item.category}</Text>
                  </View>
                  <Text style={[styles.td, { width: '18%' }]}>
                    {item.brand || ''} {item.model || ''}
                  </Text>
                  <Text style={[styles.td, { width: '18%', fontFamily: 'Courier' }]}>
                    {item.serialNumber || '—'}
                  </Text>
                  <Text style={[styles.td, { width: '13%', fontWeight: 'bold', color: '#4F46E5' }]}>
                    {item.assetTag || '—'}
                  </Text>
                  <View style={{ width: '18%' }}>
                    <Text style={[styles.tdBold, { fontSize: 7.5 }]}>
                      {conditionLabel[item.condition] || item.condition}
                    </Text>
                    {item.accessories && (
                      <Text style={{ fontSize: 6.5, color: '#475569' }}>Acc: {item.accessories}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.td, { width: '100%', textAlign: 'center', padding: 8 }]}>
                  Aucun équipement renseigné.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 3: Clauses & Engagements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>3. CLAUSES D&apos;ENGAGEMENT ET DE RESPONSABILITÉ</Text>
          </View>
          <View style={styles.clauseBox}>
            <Text style={styles.clauseText}>
              1. Le bénéficiaire certifie avoir reçu en parfait état de marche l&apos;ensemble du matériel et accessoires
              détaillés dans le présent document.
            </Text>
            <Text style={styles.clauseText}>
              2. Ce matériel est affecté à titre strictement professionnel. L&apos;utilisateur est personnellement
              responsable de sa garde, de sa préservation et de son utilisation conforme aux règles de sécurité IT.
            </Text>
            <Text style={styles.clauseText}>
              3. Il est formellement interdit de modifier la configuration système, d&apos;installer des logiciels non
              licenciés ou de confier le matériel à une tierce personne sans accord écrit de la DSI.
            </Text>
            <Text style={styles.clauseText}>
              4. En cas de départ, mutation, fin de contrat ou sur simple demande du service informatique, le bénéficiaire
              s&apos;engage à restituer l&apos;intégralité du matériel dans son état d&apos;origine.
            </Text>
            {decharge.notes && (
              <Text style={[styles.clauseText, { marginTop: 3, fontWeight: 'bold', color: '#1E293B' }]}>
                Observations particulières : {decharge.notes}
              </Text>
            )}
          </View>
        </View>

        {/* Section 4: Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Remise par Service IT</Text>
              <Text style={styles.signatureSub}>Technicien : {decharge.technicianName}</Text>
              <Text style={styles.signatureFooterText}>Date, Visa & Cachet IT</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Visa Responsable Hiérarchique</Text>
              <Text style={styles.signatureSub}>Chef de Service / Département</Text>
              <Text style={styles.signatureFooterText}>Date, Visa & Émargement</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Bénéficiaire du Matériel</Text>
              <Text style={styles.signatureSub}>Mention « Bon pour réception »</Text>
              <Text style={styles.signatureFooterText}>Nom, Date & Signature</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>IT-ERP Enterprise System — Système de Gestion Multi-Sites</Text>
          <Text>Document Officiel de Décharge — Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};
