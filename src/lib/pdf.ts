import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { InterventionReportPDF } from '@/components/pdf/InterventionReportPDF';
import { InterventionTicketPDF } from '@/components/pdf/InterventionTicketPDF';
import { DechargeReportPDF } from '@/components/pdf/DechargeReportPDF';
import { ExecutiveReportPDF, ExecutiveReportData } from '@/components/pdf/ExecutiveReportPDF';

async function pdfToBuffer(element: React.ReactElement<any>): Promise<Buffer> {
  const instance = pdf(element);
  const stream = await instance.toBuffer();

  if (Buffer.isBuffer(stream)) return stream;

  const chunks: Uint8Array[] = [];
  // @ts-ignore — iterate readable stream chunks
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function renderReportPDFToBuffer(
  ticket: {
    ticketNumber:  string;
    fullName:      string;
    service:       string;
    unitType:      string;
    unitName:      string;
    equipment:     string;
    ipAddress?:    string | null;
    serialNumber?: string | null;
    priority:      string;
    description:   string;
    createdAt:     Date | string;
  },
  report: {
    reportNumber:   string;
    technicianName: string;
    diagnosis:      string;
    actionsTaken:   string;
    partsReplaced?: string | null;
    finalStatus:    string;
    completedAt:    Date | string;
  }
): Promise<Buffer> {
  const element = React.createElement(InterventionReportPDF, { ticket, report });
  return pdfToBuffer(element);
}

export async function renderTicketPDFToBuffer(ticket: {
  ticketNumber:  string;
  fullName:      string;
  functionTitle?: string | null;
  service:       string;
  unitType:      string;
  unitName:      string;
  phone?:        string | null;
  email?:        string | null;
  managerName?:  string | null;
  equipment:     string;
  ipAddress?:    string | null;
  serialNumber?: string | null;
  priority:      string;
  description:   string;
  status:        string;
  createdAt:     Date | string;
}): Promise<Buffer> {
  const element = React.createElement(InterventionTicketPDF, { ticket });
  return pdfToBuffer(element);
}

export async function renderDechargePDFToBuffer(decharge: {
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
}): Promise<Buffer> {
  const element = React.createElement(DechargeReportPDF, { decharge });
  return pdfToBuffer(element);
}

export async function renderExecutiveReportPDFToBuffer(data: ExecutiveReportData): Promise<Buffer> {
  const element = React.createElement(ExecutiveReportPDF, { data });
  return pdfToBuffer(element);
}

