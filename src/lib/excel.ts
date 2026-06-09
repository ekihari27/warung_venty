import ExcelJS from "exceljs";

export async function generateExcelReport({
  title,
  subtitle,
  userName,
  headers,
  rows,
  summaryRows = [],
}: {
  title: string;
  subtitle: string;
  userName: string;
  headers: { header: string; key: string; width: number }[];
  rows: unknown[];
  summaryRows?: { label: string; colSpan: number; value: number | string; isCurrency?: boolean }[];
}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Laporan");

  // Style helper constants
  const EMERALD_DARK = "047857";

  // Title block
  worksheet.mergeCells("A1:E1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: EMERALD_DARK } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 40;

  // Subtitle
  worksheet.mergeCells("A2:E2");
  const subCell = worksheet.getCell("A2");
  subCell.value = subtitle;
  subCell.font = { name: "Arial", size: 11, italic: true };
  subCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 20;

  // Info Block (User & Timestamp)
  worksheet.getCell("A4").value = "Dicetak Oleh:";
  worksheet.getCell("A4").font = { bold: true };
  worksheet.getCell("B4").value = userName;

  worksheet.getCell("A5").value = "Tanggal Cetak:";
  worksheet.getCell("A5").font = { bold: true };
  worksheet.getCell("B5").value = new Date().toLocaleString("id-ID");

  worksheet.addRow([]); // empty row

  // Table Headers
  const headerRow = worksheet.addRow(headers.map(h => h.header));
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "10B981" }, // Emerald 500
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "medium" },
      right: { style: "thin" },
    };
  });

  // Table Columns config
  worksheet.columns = headers.map(h => ({ key: h.key, width: h.width }));

  // Table Rows
  rows.forEach((rowData, idx) => {
    const row = worksheet.addRow(rowData);
    row.height = 20;
    
    // Zebra striping
    const fillType = idx % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB";
    
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillType } };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      
      // Auto-align and format based on content
      const val = cell.value;
      if (typeof val === "number") {
        cell.numFmt = "#,##0";
        cell.alignment = { horizontal: "right" };
      } else if (val instanceof Date) {
        cell.value = val.toLocaleDateString("id-ID");
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  // Summary footer
  if (summaryRows.length > 0) {
    worksheet.addRow([]); // Blank row spacer
    summaryRows.forEach((sum) => {
      const sumRow = worksheet.addRow([sum.label, ...Array(sum.colSpan - 1).fill(""), sum.value]);
      sumRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        if (colNumber === sum.colSpan + 1) {
          if (sum.isCurrency) {
            cell.numFmt = '"Rp"#,##0';
          }
          cell.alignment = { horizontal: "right" };
        }
      });
    });
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
