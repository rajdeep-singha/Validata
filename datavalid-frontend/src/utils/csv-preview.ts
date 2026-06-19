import Papa from 'papaparse';

export interface CsvPreview {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvPreview(file: File, maxRows = 5): Promise<CsvPreview> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: maxRows,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = (results.meta.fields ?? []) as string[];
        const rows = (results.data ?? []) as Record<string, string>[];
        resolve({ headers, rows: rows.slice(0, maxRows) });
      },
      // On error, resolve with empty preview so upload button still appears
      error: () => resolve({ headers: [], rows: [] }),
    });
  });
}
