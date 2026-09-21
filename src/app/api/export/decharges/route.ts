import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const status = searchParams.get('status');
    const dischargeType = searchParams.get('dischargeType');
    const unitType = searchParams.get('unitType');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (dischargeType && dischargeType !== 'ALL') where.dischargeType = dischargeType;
    if (unitType && unitType !== 'ALL') where.unitType = unitType;

    const decharges = await prisma.equipmentDecharge.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { dischargeDate: 'desc' },
    });

    const statusTranslations: Record<string, string> = {
      ACTIVE: 'سارية / قيد الاستعمال (Actif)',
      RETURNED: 'مسترجعة بالكامل (Restitué)',
      CANCELLED: 'ملغاة (Annulé)',
    };

    const typeTranslations: Record<string, string> = {
      PERMANENT: 'تخصيص نهائي دائم',
      TEMPORARY: 'إعارة مؤقتة',
    };

    const unitTypeTranslations: Record<string, string> = {
      FILIALE: 'مديرية جهوية (Filiale)',
      CIC: 'مديرية ولائية (CIC)',
      UPC: 'وحدة إنتاجية (UPC)',
    };

    const conditionTranslations: Record<string, string> = {
      NEUF: 'جديد تماماً (Neuf)',
      BON_ETAT: 'حالة جيدة (Bon état)',
      ETAT_MOYEN: 'حالة متوسطة (État moyen)',
    };

    const masterColumns: ColumnDef[] = [
      { header: 'N°', key: 'idNum', width: 8, align: 'center' },
      { header: 'رقم سند التفريغ', key: 'dechargeNumber', width: 18, align: 'center' },
      { header: 'تاريخ السند', key: 'dischargeDate', width: 16, align: 'center' },
      { header: 'نوع التخصيص', key: 'dischargeType', width: 18, align: 'center' },
      { header: 'حالة السند', key: 'status', width: 22, align: 'center' },
      { header: 'المستفيد', key: 'beneficiaryName', width: 24, align: 'right' },
      { header: 'الوظيفة', key: 'functionTitle', width: 20, align: 'right' },
      { header: 'المصلحة / الاتجاه', key: 'department', width: 22, align: 'right' },
      { header: 'رقم القيد / ب.ت.و', key: 'matricule', width: 18, align: 'center' },
      { header: 'الهاتف', key: 'phone', width: 16, align: 'center' },
      { header: 'الهيكل التنظيمي', key: 'unitType', width: 22, align: 'right' },
      { header: 'اسم الموقع / الوحدة', key: 'unitName', width: 25, align: 'right' },
      { header: 'التقني المسلّم', key: 'technicianName', width: 20, align: 'right' },
      { header: 'عدد العتاد المسلّم', key: 'itemsCount', width: 16, align: 'center' },
      { header: 'تاريخ الإرجاع المتوقع', key: 'expectedReturnDate', width: 18, align: 'center' },
      { header: 'تاريخ الإرجاع الفعلي', key: 'returnedAt', width: 18, align: 'center' },
      { header: 'ملاحظات الإرجاع', key: 'returnNotes', width: 25, align: 'right' },
      { header: 'ملاحظات عامة', key: 'notes', width: 25, align: 'right' },
    ];

    const masterRows = decharges.map((d, idx) => ({
      idNum: idx + 1,
      dechargeNumber: d.dechargeNumber,
      dischargeDate: new Date(d.dischargeDate).toLocaleDateString('fr-FR'),
      dischargeType: typeTranslations[d.dischargeType] || d.dischargeType,
      status: statusTranslations[d.status] || d.status,
      beneficiaryName: d.beneficiaryName,
      functionTitle: d.functionTitle || '—',
      department: d.department,
      matricule: d.matricule || '—',
      phone: d.phone || '—',
      unitType: unitTypeTranslations[d.unitType] || d.unitType,
      unitName: d.unitName,
      technicianName: d.technicianName,
      itemsCount: d.items.length,
      expectedReturnDate: d.expectedReturnDate ? new Date(d.expectedReturnDate).toLocaleDateString('fr-FR') : 'غير محدد',
      returnedAt: d.returnedAt ? new Date(d.returnedAt).toLocaleDateString('fr-FR') : '—',
      returnNotes: d.returnNotes || '',
      notes: d.notes || '',
    }));

    // Itemized sheet
    const itemColumns: ColumnDef[] = [
      { header: 'N°', key: 'idNum', width: 8, align: 'center' },
      { header: 'رقم سند العهدة', key: 'dechargeNumber', width: 18, align: 'center' },
      { header: 'اسم المستفيد', key: 'beneficiaryName', width: 22, align: 'right' },
      { header: 'تسمية العتاد المسلم', key: 'equipmentName', width: 25, align: 'right' },
      { header: 'الفئة', key: 'category', width: 18, align: 'center' },
      { header: 'العلامة التجارية', key: 'brand', width: 16, align: 'center' },
      { header: 'الموديل', key: 'model', width: 18, align: 'center' },
      { header: 'الرقم التسلسلي S/N', key: 'serialNumber', width: 20, align: 'center' },
      { header: 'الرمز الجردي (Asset Tag)', key: 'assetTag', width: 20, align: 'center' },
      { header: 'حالة العتاد عند التسليم', key: 'condition', width: 22, align: 'center' },
      { header: 'الملحقات المسلّمة', key: 'accessories', width: 30, align: 'right' },
    ];

    const itemRows: any[] = [];
    let itemIdx = 1;
    decharges.forEach((d) => {
      d.items.forEach((item) => {
        itemRows.push({
          idNum: itemIdx++,
          dechargeNumber: d.dechargeNumber,
          beneficiaryName: d.beneficiaryName,
          equipmentName: item.equipmentName,
          category: item.category,
          brand: item.brand || '—',
          model: item.model || '—',
          serialNumber: item.serialNumber || '—',
          assetTag: item.assetTag || '—',
          condition: conditionTranslations[item.condition] || item.condition,
          accessories: item.accessories || 'بدون ملحقات إضافية',
        });
      });
    });

    const workbook = createERPWorkbook();

    buildStyledTableSheet(workbook, masterColumns, masterRows, {
      sheetName: 'سجل سندات العهدة',
      reportTitle: 'DIRECTION DES SYSTÈMES D\'INFORMATION — GESTION DES DÉCHARGES',
      reportSubtitle: 'REGISTRE OFFICIEL DES BONS DE DÉCHARGE & AFFECTATION DE MATÉRIEL IT',
      themeColor: 'D97706', // Amber / Gold
    });

    buildStyledTableSheet(workbook, itemColumns, itemRows, {
      sheetName: 'تفاصيل الأجهزة المسلمة',
      reportTitle: 'DIRECTION DES SYSTÈMES D\'INFORMATION — DÉTAIL MATÉRIEL REMIS',
      reportSubtitle: 'INVENTAIRE DÉTAILLÉ DES ÉQUIPEMENTS REMIS PAR BONS DE DÉCHARGE',
      themeColor: '0F172A', // Slate Dark
    });

    const totalDecharges = decharges.length;
    const activeCount = decharges.filter(d => d.status === 'ACTIVE').length;
    const returnedCount = decharges.filter(d => d.status === 'RETURNED').length;
    const permanentCount = decharges.filter(d => d.dischargeType === 'PERMANENT').length;
    const temporaryCount = decharges.filter(d => d.dischargeType === 'TEMPORARY').length;

    buildSummaryKPISheet(workbook, 'مؤشرات حركة العهدة', 'إحصائيات تسليم واسترجاع العتاد IT', [
      {
        groupName: 'وضعية السندات الحالية',
        items: [
          { label: 'إجمالي سندات العهدة المحررة', value: totalDecharges, note: 'كامل السجلات' },
          { label: 'سندات نشطة قيد الاستعمال بالخدمة', value: activeCount, note: 'لدى الموظفين' },
          { label: 'سندات مسترجعة للمخزن بالكامل', value: returnedCount, note: 'تمت إعادتها' },
          { label: 'إجمالي قطع العتاد المسلّمة', value: itemRows.length, note: 'أجهزة وملحقات' },
        ],
      },
      {
        groupName: 'طبيعة التخصيص والاستعارة',
        items: [
          { label: 'تخصيص نهائي دائم لمكاتب الموظفين', value: permanentCount, note: 'عهدة دائمة' },
          { label: 'إعارة مؤقتة لمهام محددة', value: temporaryCount, note: 'خاضعة لتواريخ إرجاع' },
        ],
      },
    ]);

    const buffer = await workbookToBuffer(workbook);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Registre_Decharges_Materiel_${dateStr}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[Export Decharges Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
