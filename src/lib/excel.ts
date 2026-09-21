import ExcelJS from 'exceljs';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
}

export interface SheetOptions {
  sheetName: string;
  reportTitle: string;
  reportSubtitle: string;
  metaText?: string;
  themeColor?: string; // e.g. '4F46E5' (Indigo), '0284C7' (Sky), '059669' (Emerald), '7C3AED' (Purple)
  badgeColumnKey?: string; // Column that contains status / priority for badge styling
}

/**
 * Creates a pre-configured ExcelJS Workbook with official ERP metadata
 */
export function createERPWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'IT-Tasker Enterprise ERP';
  workbook.lastModifiedBy = 'Direction des Systèmes d\'Information';
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
}

/**
 * Builds a highly styled, professional corporate sheet
 */
export function buildStyledTableSheet(
  workbook: ExcelJS.Workbook,
  columns: ColumnDef[],
  dataRows: Record<string, any>[],
  options: SheetOptions
) {
  const sheet = workbook.addWorksheet(options.sheetName, {
    views: [
      {
        state: 'frozen',
        ySplit: 5, // Freeze the top 5 rows (Header banners + Table Header)
        rightToLeft: true,
      },
    ],
  });

  const totalCols = columns.length;
  const themeHex = (options.themeColor || '4F46E5').replace('#', '');
  const endColLetter = sheet.getColumn(totalCols).letter;

  // 1. Title Banner (Row 1)
  sheet.mergeCells(`A1:${endColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = options.reportTitle;
  titleCell.font = {
    name: 'Segoe UI',
    size: 13,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }, // Slate 900
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 32;

  // 2. Subtitle Banner (Row 2)
  sheet.mergeCells(`A2:${endColLetter}2`);
  const subTitleCell = sheet.getCell('A2');
  subTitleCell.value = options.reportSubtitle;
  subTitleCell.font = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: 'FFE2E8F0' }, // Slate 200
  };
  subTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 22;

  // 3. Metadata Bar (Row 3)
  sheet.mergeCells(`A3:${endColLetter}3`);
  const metaCell = sheet.getCell('A3');
  const nowStr = new Date().toLocaleString('fr-FR');
  metaCell.value =
    options.metaText ||
    `تاريخ ووقت الاستخراج: ${nowStr}  |  المصدر: نظام تسيير الصيانة والعتاد IT-ERP  |  إجمالي السجلات: ${dataRows.length}`;
  metaCell.font = {
    name: 'Segoe UI',
    size: 8.5,
    italic: true,
    color: { argb: 'FF475569' }, // Slate 600
  };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }, // Slate 50
  };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(3).height = 20;

  // 4. Spacer Row (Row 4)
  sheet.getRow(4).height = 8;

  // 5. Table Header Row (Row 5)
  const headerRow = sheet.getRow(5);
  headerRow.height = 28;

  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = {
      name: 'Segoe UI',
      size: 9.5,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${themeHex}` },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });

  // Enable AutoFilter on Table Headers
  sheet.autoFilter = {
    from: `A5`,
    to: `${endColLetter}5`,
  };

  // 6. Data Rows
  dataRows.forEach((rowObj, rIdx) => {
    const rowNum = 6 + rIdx;
    const row = sheet.getRow(rowNum);
    row.height = 22;
    const isEven = rIdx % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    columns.forEach((col, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      const val = rowObj[col.key];
      cell.value = val !== null && val !== undefined ? val : '—';

      cell.font = {
        name: 'Segoe UI',
        size: 9,
        color: { argb: 'FF1E293B' },
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg },
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      const defaultAlign = col.align || (typeof val === 'number' || cIdx === 0 ? 'center' : 'right');
      cell.alignment = { horizontal: defaultAlign, vertical: 'middle' };

      // Badge highlights for specific statuses
      if (typeof val === 'string') {
        if (val.includes('تم الحل') || val.includes('Opérationnel') || val.includes('جديد تماماً') || val.includes('متوفر بكمية')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Emerald 100
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF166534' } };
        } else if (val.includes('قيد الانتظار') || val.includes('سارية') || val.includes('متوسط')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Amber 100
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF92400E' } };
        } else if (val.includes('قيد المعالجة') || val.includes('قيد الصيانة')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Sky 100
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF0369A1' } };
        } else if (val.includes('حرجة') || val.includes('معطل') || val.includes('نافد') || val.includes('حرج')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Red 100
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF991B1B' } };
        } else if (val.includes('مستعجلة')) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }; // Orange 100
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFC2410C' } };
        }
      }
    });
  });

  // 7. Auto-calculate Column Widths with comfortable padding
  columns.forEach((col, idx) => {
    let maxLen = col.header.length;
    dataRows.forEach((r) => {
      const v = r[col.key];
      if (v !== null && v !== undefined) {
        const s = String(v);
        if (s.length > maxLen) maxLen = Math.min(s.length, 50);
      }
    });
    sheet.getColumn(idx + 1).width = Math.max(maxLen + 4, col.width || 13);
  });
}

/**
 * Builds an Executive KPI summary sheet with card-like tables
 */
export function buildSummaryKPISheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  title: string,
  kpiGroups: Array<{
    groupName: string;
    items: Array<{ label: string; value: string | number; note?: string }>;
  }>
) {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'normal', rightToLeft: true }],
  });

  // Banner
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  let currentRow = 3;

  kpiGroups.forEach((group) => {
    // Group Header
    sheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const groupCell = sheet.getCell(`A${currentRow}`);
    groupCell.value = `📊 ${group.groupName}`;
    groupCell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    groupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    groupCell.alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getRow(currentRow).height = 24;
    currentRow++;

    // Table Header
    const thRow = sheet.getRow(currentRow);
    thRow.height = 20;
    ['المؤشر أو الخاصية', 'القيمة الإحصائية', 'الملاحظات الإضافية'].forEach((th, idx) => {
      const cell = thRow.getCell(idx + 1);
      cell.value = th;
      cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF334155' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
      cell.alignment = { horizontal: idx === 0 ? 'right' : 'center', vertical: 'middle' };
    });
    currentRow++;

    // Items
    group.items.forEach((item, iIdx) => {
      const row = sheet.getRow(currentRow);
      row.height = 20;
      const isEven = iIdx % 2 === 0;
      const bg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      const cellLabel = row.getCell(1);
      cellLabel.value = item.label;
      cellLabel.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1E293B' } };
      cellLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cellLabel.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

      const cellVal = row.getCell(2);
      cellVal.value = item.value;
      cellVal.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF4F46E5' } };
      cellVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cellVal.alignment = { horizontal: 'center', vertical: 'middle' };
      cellVal.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

      const cellNote = row.getCell(3);
      cellNote.value = item.note || '—';
      cellNote.font = { name: 'Segoe UI', size: 8.5, color: { argb: 'FF64748B' } };
      cellNote.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cellNote.alignment = { horizontal: 'center', vertical: 'middle' };
      cellNote.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

      currentRow++;
    });

    currentRow += 2; // spacing between groups
  });

  sheet.getColumn(1).width = 38;
  sheet.getColumn(2).width = 24;
  sheet.getColumn(3).width = 35;
}

/**
 * Converts workbook into a downloadable Buffer
 */
export async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
