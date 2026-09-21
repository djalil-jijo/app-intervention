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
    const unitType = searchParams.get('unitType');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'xlsx';

    const where: any = {};
    if (unitType && unitType !== 'ALL') where.unitType = unitType;
    if (status && status !== 'ALL') where.status = status;
    if (type && type !== 'ALL') where.type = type;

    const assets = await prisma.iTAsset.findMany({
      where,
      include: {
        tickets: {
          select: { id: true, status: true },
        },
      },
      orderBy: { assetTag: 'asc' },
    });

    const statusTranslations: Record<string, string> = {
      OPERATIONAL: 'جاهز ويعمل (Opérationnel)',
      DEFECTIVE: 'معطل (En panne)',
      UNDER_MAINTENANCE: 'قيد الصيانة (En maintenance)',
      SCRAPPED: 'خارج الخدمة / تالف (Réformé)',
    };

    const typeTranslations: Record<string, string> = {
      DESKTOP: 'حاسوب مكتبي',
      LAPTOP: 'حاسوب محمول',
      SERVER: 'خادم (Serveur)',
      PRINTER: 'طابعة / ماسح',
      SWITCH_ROUTER: 'شبكات (Switch / Routeur)',
      UPS: 'مزوّد طاقة (Onduleur)',
      MONITOR: 'شاشة عرض',
    };

    const unitTypeTranslations: Record<string, string> = {
      FILIALE: 'مديرية جهوية (Filiale)',
      CIC: 'مديرية ولائية (CIC)',
      UPC: 'وحدة إنتاجية (UPC)',
    };

    const columns: ColumnDef[] = [
      { header: 'N°', key: 'idNum', width: 8, align: 'center' },
      { header: 'الرمز الجردي (Asset Tag)', key: 'assetTag', width: 18, align: 'center' },
      { header: 'تسمية العتاد', key: 'name', width: 24, align: 'right' },
      { header: 'فئة العتاد', key: 'type', width: 18, align: 'center' },
      { header: 'العلامة التجارية', key: 'brand', width: 16, align: 'center' },
      { header: 'الموديل', key: 'model', width: 18, align: 'center' },
      { header: 'الرقم التسلسلي S/N', key: 'serialNumber', width: 20, align: 'center' },
      { header: 'الحالة التشغيلية', key: 'status', width: 22, align: 'center' },
      { header: 'الهيكل التنظيمي', key: 'unitType', width: 22, align: 'right' },
      { header: 'اسم الموقع / الوحدة', key: 'unitName', width: 25, align: 'right' },
      { header: 'المصلحة / القسم', key: 'service', width: 20, align: 'right' },
      { header: 'الموظف المخصص له', key: 'assignedTo', width: 22, align: 'right' },
      { header: 'عنوان IP', key: 'ipAddress', width: 16, align: 'center' },
      { header: 'سجل الأعطال (تذاكر)', key: 'ticketsCount', width: 15, align: 'center' },
      { header: 'تاريخ الاقتناء', key: 'purchaseDate', width: 16, align: 'center' },
      { header: 'نهاية الضمان', key: 'warrantyEnd', width: 16, align: 'center' },
      { header: 'ملاحظات', key: 'notes', width: 25, align: 'right' },
    ];

    const rows = assets.map((a, idx) => ({
      idNum: idx + 1,
      assetTag: a.assetTag,
      name: a.name,
      type: typeTranslations[a.type] || a.type,
      brand: a.brand || '—',
      model: a.model || '—',
      serialNumber: a.serialNumber || '—',
      status: statusTranslations[a.status] || a.status,
      unitType: unitTypeTranslations[a.unitType] || a.unitType,
      unitName: a.unitName,
      service: a.service || '—',
      assignedTo: a.assignedTo || 'غير مخصص / احتياطي',
      ipAddress: a.ipAddress || '—',
      ticketsCount: a.tickets.length,
      purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString('fr-FR') : '—',
      warrantyEnd: a.warrantyEnd ? new Date(a.warrantyEnd).toLocaleDateString('fr-FR') : '—',
      notes: a.notes || '',
    }));

    if (format === 'csv') {
      const csvWorksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(csvWorksheet);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Inventaire_Parc_IT_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const workbook = createERPWorkbook();

    buildStyledTableSheet(workbook, columns, rows, {
      sheetName: 'سجل جرد العتاد',
      reportTitle: 'DIRECTION DES SYSTÈMES D\'INFORMATION — GESTION DU PARC IT',
      reportSubtitle: 'INVENTAIRE GLOBAL, AFFECTATIONS & ÉTAT OPÉRATIONNEL DU MATÉRIEL',
      themeColor: '4F46E5', // Indigo
    });

    const totalAssets = assets.length;
    const operationalCount = assets.filter(a => a.status === 'OPERATIONAL').length;
    const defectiveCount = assets.filter(a => a.status === 'DEFECTIVE').length;
    const underMaintenanceCount = assets.filter(a => a.status === 'UNDER_MAINTENANCE').length;
    const scrappedCount = assets.filter(a => a.status === 'SCRAPPED').length;
    const operationalRate = totalAssets > 0 ? Math.round((operationalCount / totalAssets) * 100) : 0;

    buildSummaryKPISheet(workbook, 'مؤشرات أسطول العتاد', 'تحليل جاهزية وتوزيع الحظيرة المعلوماتية', [
      {
        groupName: 'معدلات الجاهزية والتشغيل',
        items: [
          { label: 'إجمالي الأجهزة والعتاد المسجل', value: totalAssets, note: 'كامل الحظيرة' },
          { label: 'العتاد المشغّل والجاهز للعمل', value: operationalCount, note: 'حالة ممتازة' },
          { label: 'العتاد المعطل أو في حالة خلل', value: defectiveCount, note: 'يحتاج إصلاح' },
          { label: 'العتاد قيد الصيانة بالورشة', value: underMaintenanceCount, note: 'جاري الصيانة' },
          { label: 'العتاد التالف / خارج الخدمة', value: scrappedCount, note: 'مصلوح للإلغاء' },
          { label: 'نسبة الجاهزية التشغيلية للأسطول', value: `${operationalRate}%`, note: 'مؤشر الاعتمادية' },
        ],
      },
      {
        groupName: 'توزيع العتاد حسب الأصناف الرئيسية',
        items: [
          { label: 'الحواسيب المكتبية (Desktops)', value: assets.filter(a => a.type === 'DESKTOP').length, note: 'أجهزة مكتبية' },
          { label: 'الحواسيب المحمولة (Laptops)', value: assets.filter(a => a.type === 'LAPTOP').length, note: 'أجهزة تنقل' },
          { label: 'الخوادم والبنية التحتية (Servers)', value: assets.filter(a => a.type === 'SERVER').length, note: 'غرفة الخوادم' },
          { label: 'أجهزة الشبكات والربط (Switch/Router)', value: assets.filter(a => a.type === 'SWITCH_ROUTER').length, note: 'البنية الشبكية' },
          { label: 'الطابعات والماسحات (Printers)', value: assets.filter(a => a.type === 'PRINTER').length, note: 'أجهزة الطباعة' },
        ],
      },
    ]);

    const buffer = await workbookToBuffer(workbook);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Inventaire_Parc_Informatique_${dateStr}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[Export Assets Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
