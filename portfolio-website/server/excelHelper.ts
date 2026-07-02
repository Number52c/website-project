import ExcelJS from "exceljs";
const { Workbook } = ExcelJS;

/**
 * Parse Excel or CSV file from base64 buffer
 * Returns workbook with sheet data
 */
export async function parseExcelFile(
  fileBase64: string,
  fileName?: string
): Promise<{
  sheetNames: string[];
  sheets: Record<string, Record<string, any>[]>;
  sheetsAsArrays: Record<string, (string | number | null)[][]>;
}> {
  const buffer = Buffer.from(fileBase64, "base64");
  const workbook = new Workbook();

  // Determine if CSV or Excel
  const isCSV = (fileName || "").toLowerCase().endsWith(".csv");

  if (isCSV) {
    // For CSV, read as text and parse manually
    await workbook.csv.read(buffer as any);
  } else {
    // For Excel files
    await workbook.xlsx.load(buffer as any);
  }

  const sheetNames = workbook.worksheets.map((ws) => ws.name);
  const sheets: Record<string, Record<string, any>[]> = {};
  const sheetsAsArrays: Record<string, (string | number | null)[][]> = {};

  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name;

    // Convert to array of objects (with headers from first row)
    const rows: Record<string, any>[] = [];
    const arrayRows: (string | number | null)[][] = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values;
      if (Array.isArray(values)) {
        // For array format (skip index 0 which is empty)
        arrayRows.push(values.slice(1) as (string | number | null)[]);

        // For object format (use first row as headers)
        if (rowNumber === 1) {
          // Skip header row for object format
        } else if (rowNumber > 1) {
          const obj: Record<string, any> = {};
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell((cell, colNumber) => {
            const headerValue = cell.value;
            const dataValue = values[colNumber];
            if (headerValue) {
              obj[String(headerValue)] = dataValue || "";
            }
          });
          rows.push(obj);
        }
      }
    });

    sheets[sheetName] = rows;
    sheetsAsArrays[sheetName] = arrayRows;
  }

  return {
    sheetNames,
    sheets,
    sheetsAsArrays,
  };
}

/**
 * Convert worksheet to array of objects with header row
 */
export function sheetToJson(
  sheetData: (string | number | null)[][],
  options?: { defval?: string }
): Record<string, any>[] {
  if (sheetData.length === 0) return [];

  const headers = sheetData[0];
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row: Record<string, any> = {};
    const values = sheetData[i];

    for (let j = 0; j < headers.length; j++) {
      const header = String(headers[j] || "");
      const value = values[j] ?? (options?.defval || "");
      row[header] = value;
    }

    rows.push(row);
  }

  return rows;
}
