import type { SkusavvyFullReportProps } from "../../types/types";

type Column<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

type CsvOptions = {
  delimiter?: string;
  bom?: boolean;
};

type WarehouseRow = SkusavvyFullReportProps["warehouses"][number];

const COLUMNS: Array<Column<WarehouseRow>> = [
  { header: "ID", value: (w) => w.id },
  { header: "Warehouse", value: (w) => w.name },
  { header: "Total products", value: (w) => w.totalProducts },
  { header: "Total price", value: (w) => w.totalPrice },
  { header: "Total costs", value: (w) => w.totalCosts },
  { header: "Total committed", value: (w) => w.totalCommitted },
];

const escapeCell = (raw: unknown, delimiter: string): string => {
  if (raw === null || raw === undefined) return "";

  let value = String(raw);

  
  if (/^[=+\-@\t\r]/.test(value)) {
    value = `'${value}`;
  }

  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
};

export const fullReportToCsv = (
  report: SkusavvyFullReportProps,
  options: CsvOptions = {}
): string => {
  const { delimiter = ",", bom = true } = options;

  const header = COLUMNS.map((c) => escapeCell(c.header, delimiter)).join(delimiter);

  const rows = (report?.warehouses ?? []).map((warehouse) =>
    COLUMNS.map((c) => escapeCell(c.value(warehouse), delimiter)).join(delimiter)
  );

  
  const csv = [header, ...rows].join("\r\n");

  return bom ? `\uFEFF${csv}` : csv;
};

export const toFilenameDate = (reportDate?: string): string => {
  const safe = (reportDate ?? "")
    .trim()
    .replace(/[^0-9A-Za-z-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe || new Date().toLocaleDateString("en-CA");
};

export const downloadFullReportCsv = (
  report: SkusavvyFullReportProps,
  reportDate?: string,
  options?: CsvOptions
) => {
  const filename = `felipapp-skusavvy-warehouses-report-${toFilenameDate(reportDate)}.csv`;
  const csv = fullReportToCsv(report, options);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};