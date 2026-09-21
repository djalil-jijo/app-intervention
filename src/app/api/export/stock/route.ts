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
    const category = searchParams.get('category');
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;

    const spareParts = await prisma.sparePart.findMany({
      where,
      orderBy: { quantity: 'asc' },
    });

    const filteredParts = lowStockOnly
      ? spareParts.filter((p) => p.quantity <= p.minThreshold)
      : spareParts;

    let totalValuation = 0;
    let criticalItemsCount = 0;
    let outOfStockCount = 0;

    const columns: ColumnDef[] = [
      { header: 'N°', key: 'idNum', width: 8, align: 'center' },
      { header: 'تسمية القطعة / المستهلك', key: 'name', width: 28, align: 'right' },
      { header: 'الرمز المرجعي (P/N)', key: 'partNumber', width: 18, align: 'center' },
      { header: 'الصنف / الفئة', key: 'category', width: 20, align: 'center' },
      { header: 'الكمية المتوفرة', key: 'quantity', width: 16, align: 'center' },
      { header: 'حد التنبيه الأدنى', key: 'minThreshold', width: 16, align: 'center' },
      { header: 'وضعية المخزون', key: 'alertStatus', width: 26, align: 'center' },
      { header: 'سعر الوحدة (دج)', key: 'unitPrice', width: 18, align: 'center' },
      { header: 'القيمة الإجمالية (دج)', key: 'totalValue', width: 20, align: 'center' },
      { header: 'موقع التخزين / الرف', key: 'location', width: 22, align: 'right' },
      { header: 'تاريخ آخر تحديث', key: 'updatedAt', width: 16, align: 'center' },
    ];

    const rows = filteredParts.map((p, idx) => {
      const isCritical = p.quantity <= p.minThreshold;
      const isOut = p.quantity === 0;
      const val = p.quantity * p.unitPrice;
      totalValuation += val;
      if (isOut) outOfStockCount++;
      if (isCritical) criticalItemsCount++;

      let alertStatus = 'متوفر بكمية كافية (En Stock)';
      if (isOut) alertStatus = 'نافد تماماً (Rupture de Stock)';
      else if (isCritical) alertStatus = 'حرج / تحت حد الطلب (Seuil d\'Alerte)';

      return {
        idNum: idx + 1,
        name: p.name,
        partNumber: p.partNumber || '—',
        category: p.category,
        quantity: p.quantity,
        minThreshold: p.minThreshold,
        alertStatus,
        unitPrice: `${p.unitPrice.toLocaleString('fr-FR')} دج`,
        totalValue: `${val.toLocaleString('fr-FR')} دج`,
        location: p.location || 'المخزن الرئيسي',
        updatedAt: new Date(p.updatedAt).toLocaleDateString('fr-FR'),
      };
    });

    const workbook = createERPWorkbook();

    buildStyledTableSheet(workbook, columns, rows, {
      sheetName: 'جرد قطع الغيار والمستهلكات',
      reportTitle: 'DIRECTION DES SYSTÈMES D\'INFORMATION — GESTION DES STOCKS IT',
      reportSubtitle: 'INVENTAIRE DES PIÈCES DE RECHANGE, CONSOMMABLES & VALORISATION FINANCIÈRE',
      themeColor: '059669', // Emerald Green
    });

    buildSummaryKPISheet(workbook, 'تقييم المخزون المالي', 'المؤشرات المالية والتنبيهات الحرجة للمخزون', [
      {
        groupName: 'التقييم المالي الإجمالي',
        items: [
          { label: 'القيمة المالية الإجمالية للمخزون', value: `${totalValuation.toLocaleString('fr-FR')} دج`, note: 'تقييم القطع المتوفرة' },
          { label: 'إجمالي الأصناف والقطع المسجلة', value: filteredParts.length, note: 'عدد المراجع' },
        ],
      },
      {
        groupName: 'تنبيهات العجز ونفاد المخزون',
        items: [
          { label: 'قطع وأصناف نافدة تماماً (0 وحدة)', value: outOfStockCount, note: 'تستدعي طلبيات مستعجلة' },
          { label: 'قطع تحت حد التنبيه الأدنى', value: criticalItemsCount, note: 'اقتراب النفاد' },
          { label: 'قطع متوفرة بمستوى آمن', value: filteredParts.length - criticalItemsCount, note: 'مخزون طبيعي' },
        ],
      },
    ]);

    const buffer = await workbookToBuffer(workbook);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Inventaire_Stock_Pieces_${dateStr}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('[Export Stock Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
