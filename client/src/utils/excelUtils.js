import * as XLSX from "xlsx";

/**
 * Download an array of objects as a .xlsx Excel file.
 * @param {Object[]} data   - rows (plain objects)
 * @param {string}   filename - e.g. "production_report.xlsx"
 * @param {string}   sheetName - worksheet tab name
 */
export function downloadExcel(data, filename, sheetName = "Sheet1") {
  if (!data || data.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? "").length)
    ) + 2,
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

/**
 * Download multiple sheets in one .xlsx workbook.
 * @param {{ name: string, data: Object[] }[]} sheets
 * @param {string} filename
 */
export function downloadExcelMultiSheet(sheets, filename) {
  const wb = XLSX.utils.book_new();
  for (const { name, data } of sheets) {
    if (!data || data.length === 0) continue;
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "").length)) + 2,
    }));
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, filename);
}
