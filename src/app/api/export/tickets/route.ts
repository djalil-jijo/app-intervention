import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import {
  createERPWorkbook,
  buildStyledTableSheet,
  buildSummaryKPISheet,
  workbookToBuffer,
  ColumnDef,
} from '@/lib/excel';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx';
    const status = searchParams.get('status');
    const unitType = searchParams.get('unitType');
    const period = searchParams.get('period');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (unitType && unitType !== 'ALL') where.unitType = unitType;

    if (period && period !== 'ALL') {
      const now = new Date();
      if (period === 'month') {
        where.createdAt = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      } else if (period === 'quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        where.createdAt = { gte: new Date(now.getFullYear(), quarterMonth, 1) };
      } else if (period === 'year') {
        where.createdAt = { gte: new Date(now.getFullYear(), 0, 1) };
      }
    }

    const tickets = await prisma.interventionTicket.findMany({
      where,
      include: {
        technician: true,
        report: true,
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const statusTranslations: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      IN_PROGRESS: 'قيد المعالجة',
      RESOLVED: 'تم الحل بنجاح',
      CLOSED: 'مغلقة نهائياً',
    };

    const priorityTranslations: Record<string, string> = {
      LOW: 'منخفضة',
      MEDIUM: 'متوسطة',
      URGENT: 'مستعجلة',
      CRITICAL: 'حرجة وعاجلة',
    };

    const unitTypeTranslations: Record<string, string> = {
      FILIALE: 'مديرية جهوية (Filiale)',
      CIC: 'مديرية ولائية (CIC)',
      UPC: 'وحدة إنتاجية (UPC)',
    };

    const columns: ColumnDef[] = [
      { header: 'N°', key: 'idNum', width: 8, align: 'center' },
      { header: 'رقم التذكرة', key: 'ticketNumber', width: 18, align: 'center' },
      { header: 'تاريخ الطلب', key: 'createdAt', width: 18, align: 'center' },
      { header: 'الحالة الحالية', key: 'status', width: 16, align: 'center' },
      { header: 'درجة الأولوية', key: 'priority', width: 16, align: 'center' },
      { header: 'صاحب الطلب', key: 'fullName', width: 22, align: 'right' },
      { header: 'الوظيفة', key: 'functionTitle', width: 18, align: 'right' },
      { header: 'المصلحة / القسم', key: 'service', width: 20, align: 'right' },
      { header: 'الهيكل التنظيمي', key: 'unitType', width: 22, align: 'right' },
      { header: 'اسم الموقع / الفرع', key: 'unitName', width: 25, align: 'right' },
      { header: 'العتاد المعني', key: 'equipment', width: 24, align: 'right' },
      { header: 'الرقم التسلسلي S/N', key: 'serialNumber', width: 18, align: 'center' },
      { header: 'عنوان IP', key: 'ipAddress', width: 16, align: 'center' },
      { header: 'الرمز الجردي (Asset Tag)', key: 'assetTag', width: 18, align: 'center' },
      { header: 'نوع التدخل', key: 'interventionType', width: 18, align: 'center' },
      { header: 'وصف المشكلة', key: 'description', width: 35, align: 'right' },
      { header: 'التقني المكلف', key: 'technician', width: 20, align: 'right' },
      { header: 'رقم المحضر', key: 'reportNumber', width: 16, align: 'center' },
      { header: 'التشخيص التقني', key: 'diagnosis', width: 30, align: 'right' },
      { header: 'الإجراءات المتخذة', key: 'actionsTaken', width: 30, align: 'right' },
      { header: 'قطع الغيار المستبدلة', key: 'partsReplaced', width: 22, align: 'right' },
      { header: 'مدة التدخل', key: 'duration', width: 15, align: 'center' },
      { header: 'تاريخ الإغلاق', key: 'completedAt', width: 18, align: 'center' },
    ];

    const rows = tickets.map((t, idx) => {
      const durationMin = t.report?.durationMinutes;
      const durationText = durationMin ? `${Math.floor(durationMin / 60)} س و ${durationMin % 60} د` : '—';

      return {
        idNum: idx + 1,
        ticketNumber: t.ticketNumber,
        createdAt: new Date(t.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: statusTranslations[t.status] || t.status,
        priority: priorityTranslations[t.priority] || t.priority,
        fullName: t.fullName,
        functionTitle: t.functionTitle || '—',
        service: t.service,
        unitType: unitTypeTranslations[t.unitType] || t.unitType,
        unitName: t.unitName,
        equipment: t.equipment,
        serialNumber: t.serialNumber || '—',
        ipAddress: t.ipAddress || '—',
        assetTag: t.asset?.assetTag || '—',
        interventionType:
          t.interventionType === 'CURATIVE'
            ? 'علاجي (Curatif)'
            : t.interventionType === 'PREVENTIVE'
            ? 'وقائي (Préventif)'
            : 'تثبيت جديد (Installation)',
        description: t.description,
        technician: t.technician ? t.technician.name : 'غير معيّن',
        reportNumber: t.report ? t.report.reportNumber : 'لا يوجد',
        diagnosis: t.report ? t.report.diagnosis : '—',
        actionsTaken: t.report ? t.report.actionsTaken : '—',
        partsReplaced: t.report?.partsReplaced || 'لا يوجد',
        duration: durationText,
        completedAt: t.report
          ? new Date(t.report.completedAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
      };
    });

    if (format === 'csv') {
      const csvWorksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(csvWorksheet);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Rapport_Interventions_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Build Corporate Multi-Sheet Workbook with ExcelJS
    const workbook = createERPWorkbook();

    buildStyledTableSheet(workbook, columns, rows, {
      sheetName: 'سجل التدخلات التفصيلي',
      reportTitle: 'DIRECTION DES SYSTÈMES D\'INFORMATION — IT SUPPORT SERVICE',
      reportSubtitle: 'RAPPORT GÉNÉRAL & SUIVI DES DEMANDES D\'INTERVENTION TECHNIQUE',
      themeColor: '0284C7', // Sky Blue
    });

    // Summary KPIs
    const totalCount = tickets.length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

    buildSummaryKPISheet(workbook, 'مؤشرات الأداء والإحصائيات', 'مؤشرات الأداء العامة لعمليات الصيانة IT', [
      {
        groupName: 'مؤشرات الفعالية ونسب الإنجاز',
        items: [
          { label: 'إجمالي التذاكر المسجلة', value: totalCount, note: 'العدد الكلي للطلبات' },
          { label: 'التدخلات المنجزة والمغلقة بنجاح', value: resolvedCount, note: 'تم تأكيد الحل من المستخدم' },
          { label: 'التدخلات الجارية قيد المعالجة', value: inProgressCount, note: 'التقني يعمل عليها حالياً' },
          { label: 'التدخلات قيد الانتظار', value: pendingCount, note: 'في انتظار تعيين تقني' },
          { label: 'معدل النجاح والإنجاز الإجمالي', value: `${resolutionRate}%`, note: 'مؤشر أداء مصلحة الإعلام الآلي' },
        ],
      },
      {
        groupName: 'توزيع الأولويات ودرجة الاستعجال',
        items: [
          { label: 'تدخلات ذات أولوية حرجة وعاجلة', value: tickets.filter(t => t.priority === 'CRITICAL').length, note: 'تتطلب تدخلاً فورياً' },
          { label: 'تدخلات ذات أولوية مستعجلة', value: tickets.filter(t => t.priority === 'URGENT').length, note: 'خلال أقل من 4 ساعات' },
          { label: 'تدخلات ذات أولوية قياسية', value: tickets.filter(t => t.priority === 'MEDIUM' || t.priority === 'LOW').length, note: 'ضمن جدول العمل العادي' },
        ],
      },
    ]);

    const buffer = await workbookToBuffer(workbook);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Rapport_Interventions_IT_${dateStr}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[Export Tickets Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
