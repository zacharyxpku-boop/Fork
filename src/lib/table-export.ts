export type TableCell = string | number | boolean | null | undefined;

export interface CsvSheet {
  name: string;
  rows: TableCell[][];
}

const CSV_BOM = '\uFEFF';

function csvCell(value: TableCell): string {
  const text = String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return `"${text.replace(/"/g, '""')}"`;
}

function safeSheetName(name: string, index: number): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
  return `${String(index + 1).padStart(2, '0')}-${cleaned || 'sheet'}`;
}

export function tableToCsv(rows: TableCell[][]): string {
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(rows: TableCell[][], filename: string): void {
  const blob = new Blob([CSV_BOM + tableToCsv(rows)], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
}

export async function downloadCsvWorkbook(sheets: CsvSheet[], filename: string): Promise<void> {
  if (sheets.length === 0) return;
  if (sheets.length === 1) {
    downloadCsvFile(sheets[0].rows, filename.replace(/\.(zip|xlsx)$/i, '.csv'));
    return;
  }

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  sheets.forEach((sheet, index) => {
    zip.file(`${safeSheetName(sheet.name, index)}.csv`, CSV_BOM + tableToCsv(sheet.rows));
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename.replace(/\.(xlsx|csv)$/i, '.zip'));
}
