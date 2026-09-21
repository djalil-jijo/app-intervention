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
    borderBottomColor: '#4F46E5',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 0.1,
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
    minWidth: 140,
  },
  refLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  refValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 1,
  },
  dateValue: {
    fontSize: 7.5,
    color: '#475569',
    marginTop: 2,
  },
  badgePeriod: {
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    textAlign: 'center',
  },

  // KPI Ribbon Grid
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    padding: 6,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
    textTransform: 'uppercase',
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
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Tables
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: 6,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
  },
  th: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 7.5,
    color: '#1E293B',
  },
  tdBold: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colHalf: {
    width: '50%',
  },

  // Highlight Box
  highlightBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
  },
  highlightText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.35,
  },

  // Signatures
  signatureSection: {
    marginTop: 10,
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
    borderRadius: 5,
    padding: 8,
    height: 85,
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

export interface ExecutiveReportData {
  reportDate: string;
  reportRef: string;
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  avgResolutionHours: number;
  totalAssets: number;
  operationalAssets: number;
  availabilityRate: number;
  criticalPending: number;
  totalDecharges: number;
  activeDecharges: number;
  totalSpareParts: number;
  lowStockItems: number;
  byStructure: Array<{
    name: string;
    total: number;
    resolved: number;
    pending: number;
    rate: string;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
    pct: string;
  }>;
  byAssetType: Array<{
    type: string;
    total: number;
    operational: number;
  }>;
}

export const ExecutiveReportPDF: React.FC<{ data: ExecutiveReportData }> = ({ data }) => {
  return (
    <Document title={`Rapport_Executif_IT_${data.reportRef}.pdf`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.badgeCompany}>Direction des Systèmes d&apos;Information (DSI)</Text>
            <Text style={styles.docMainTitle}>RAPPORT EXÉCUTIF D&apos;ACTIVITÉ & PERFORMANCE IT</Text>
            <Text style={styles.docSubTitle}>
              Synthèse consolidée des interventions, état du parc informatique et gestion des actifs IT
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.refLabel}>RÉFÉRENCE AUDIT</Text>
            <Text style={styles.refValue}>{data.reportRef}</Text>
            <Text style={styles.dateValue}>Édité le : {data.reportDate}</Text>
            <Text style={styles.badgePeriod}>BILAN CONSOLIDÉ</Text>
          </View>
        </View>

        {/* Executive KPI Ribbon */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#4F46E5' }]}>{data.totalTickets}</Text>
            <Text style={styles.kpiLabel}>Interventions</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#059669' }]}>{data.resolutionRate}%</Text>
            <Text style={styles.kpiLabel}>Taux Résolution</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0284C7' }]}>{data.avgResolutionHours}h</Text>
            <Text style={styles.kpiLabel}>Délai Moyen (MTTR)</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#0F172A' }]}>{data.totalAssets}</Text>
            <Text style={styles.kpiLabel}>Parc Total (Équip.)</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: '#059669' }]}>{data.availabilityRate}%</Text>
            <Text style={styles.kpiLabel}>Disponibilité Parc</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiVal, { color: data.lowStockItems > 0 ? '#DC2626' : '#059669' }]}>
              {data.lowStockItems}
            </Text>
            <Text style={styles.kpiLabel}>Alertes Stock</Text>
          </View>
        </View>

        {/* Section 1: Répartition des Interventions par Structure */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>1. Activité & Répartition des Interventions par Structure</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.th, { width: '40%' }]}>Structure / Entité Réseau</Text>
              <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Demandes Totales</Text>
              <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Clôturées avec Succès</Text>
              <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>Taux de Résolution</Text>
            </View>

            {data.byStructure.map((s, idx) => (
              <View key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
                <Text style={[styles.tdBold, { width: '40%' }]}>{s.name}</Text>
                <Text style={[styles.td, { width: '20%', textAlign: 'center' }]}>{s.total}</Text>
                <Text style={[styles.td, { width: '20%', textAlign: 'center' }]}>{s.resolved}</Text>
                <Text style={[styles.tdBold, { width: '20%', textAlign: 'center', color: '#059669' }]}>
                  {s.rate}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 2: Analyse Détaillée Parc & Priorités */}
        <View style={styles.section}>
          <View style={styles.gridRow}>
            {/* Colonne Gauche: Priorité des Tickets */}
            <View style={styles.colHalf}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>2. Répartition par Priorité</Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.th, { width: '50%' }]}>Niveau d&apos;Urgence</Text>
                  <Text style={[styles.th, { width: '25%', textAlign: 'center' }]}>Nombre</Text>
                  <Text style={[styles.th, { width: '25%', textAlign: 'center' }]}>Part (%)</Text>
                </View>
                {data.byPriority.map((p, idx) => (
                  <View key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
                    <Text style={[styles.td, { width: '50%' }]}>{p.priority}</Text>
                    <Text style={[styles.tdBold, { width: '25%', textAlign: 'center' }]}>{p.count}</Text>
                    <Text style={[styles.td, { width: '25%', textAlign: 'center' }]}>{p.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Colonne Droite: État du Parc Matériel */}
            <View style={styles.colHalf}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleText}>3. État du Parc par Catégorie</Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.th, { width: '50%' }]}>Catégorie Matériel</Text>
                  <Text style={[styles.th, { width: '25%', textAlign: 'center' }]}>Total</Text>
                  <Text style={[styles.th, { width: '25%', textAlign: 'center' }]}>Opérationnel</Text>
                </View>
                {data.byAssetType.map((a, idx) => (
                  <View key={idx} style={idx % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
                    <Text style={[styles.td, { width: '50%' }]}>{a.type}</Text>
                    <Text style={[styles.tdBold, { width: '25%', textAlign: 'center' }]}>{a.total}</Text>
                    <Text style={[styles.tdBold, { width: '25%', textAlign: 'center', color: '#059669' }]}>
                      {a.operational}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Synthèse Décharges & Gestion du Stock */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleText}>4. Décharges Matériel & Disponibilité des Pièces</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              • Bons de décharge de matériel enregistrés : {data.totalDecharges} سندات (dont {data.activeDecharges} affectations actuellement actives en exploitation).
            </Text>
            <Text style={styles.highlightText}>
              • Stock des consommables et pièces de rechange : {data.totalSpareParts} références suivies.
              {data.lowStockItems > 0
                ? ` Attention : ${data.lowStockItems} référence(s) sous le seuil critique de réapprovisionnement.`
                : ' Aucun seuil d\'alerte critique signalé.'}
            </Text>
            <Text style={styles.highlightText}>
              • Ticket(s) prioritaire(s) en attente : {data.criticalPending} intervention(s) à surveiller.
            </Text>
          </View>
        </View>

        {/* Section 5: Signatures et Validations */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Responsable Support & Exploitation IT</Text>
              <Text style={styles.signatureSub}>Vérification & Validation Technique</Text>
              <Text style={styles.signatureFooterText}>Date, Visa & Émargement</Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureHeader}>Directeur des Systèmes d&apos;Information (DSI)</Text>
              <Text style={styles.signatureSub}>Approbation & Transmission Direction Générale</Text>
              <Text style={styles.signatureFooterText}>Date, Cachet & Signature</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>IT-ERP Enterprise System — Rapport Périodique de Gouvernance IT</Text>
          <Text>Document Officiel Confidentiel — Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};
