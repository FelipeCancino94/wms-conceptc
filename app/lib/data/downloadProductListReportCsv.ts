import type { ProductReport, WarehouseProps } from "../../types/types";
import { getWarehousesFromSkusavvy } from "./skusavvyFunctions";

type Column<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

type CsvOptions = {
  delimiter?: string;
  bom?: boolean;
};

const EMPTY_QUANTITY = 0;

const BASE_COLUMNS: Array<Column<ProductReport>> = [
  { header: "ID", value: (p) => p.id },
  { header: "Variant ID", value: (p) => p.variantId },
  { header: "SKU", value: (p) => p.sku },
  { header: "Barcode", value: (p) => p.barcode },
  { header: "Product", value: (p) => p.name },
  { header: "Status", value: (p) => p.status },
  { header: "Price", value: (p) => ((Number(p.price) / 1000).toFixed(2)).toString() },
  { header: "Cost", value: (p) => ((Number(p.variantCost) / 1000).toFixed(2)).toString() },
  { header: "Total quantity", value: (p) => p.totalQuantity },
  { header: "Variant inventory quantity", value: (p) => p.variantInventoryQuantity },
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

// One pair of columns per warehouse, titled with the warehouse name instead of its id
const buildWarehouseColumns = (warehouses: WarehouseProps[]): Array<Column<ProductReport>> =>
  warehouses.flatMap((warehouse) => [
    {
      header: `${warehouse.name} - on hand`,
      value: (product: ProductReport) =>
        product.warehouses.find((w) => w.id === warehouse.id)?.quantity ?? EMPTY_QUANTITY,
    },
    {
      header: `${warehouse.name} - committed`,
      value: (product: ProductReport) =>
        product.warehouses.find((w) => w.id === warehouse.id)?.committedQuantity ?? EMPTY_QUANTITY,
    },
    {
      header: `${warehouse.name} - available`,
      value: (product: ProductReport) => {
        const productFinded = product.warehouses.find((w) => w.id === warehouse.id);
        if (!productFinded) {
          return EMPTY_QUANTITY;
        }
        return (Number(productFinded.quantity) - Number(productFinded.committedQuantity)).toString();
      }
    }
  ]);

// Fallback when the warehouse list is unavailable: keep the ids found in the products themselves
const warehousesFromProducts = (products: ProductReport[]): WarehouseProps[] => {
  const seen = new Map<string, WarehouseProps>();

  for (const product of products) {
    for (const warehouse of product.warehouses) {
      if (!seen.has(warehouse.id)) {
        seen.set(warehouse.id, { id: warehouse.id, name: warehouse.name || warehouse.id });
      }
    }
  }

  return [...seen.values()];
};

export const productListToCsv = (
  products: ProductReport[],
  warehouses: WarehouseProps[],
  options: CsvOptions = {}
): string => {
  const { delimiter = ",", bom = true } = options;

  const columns = [...BASE_COLUMNS, ...buildWarehouseColumns(warehouses)];

  const header = columns.map((c) => escapeCell(c.header, delimiter)).join(delimiter);

  const rows = products.map((product) =>
    columns.map((c) => escapeCell(c.value(product), delimiter)).join(delimiter)
  );

  const csv = [header, ...rows].join("\r\n");

  return bom ? `﻿${csv}` : csv;
};

export const downloadProductListReportCsv = async (
  products: ProductReport[] | undefined,
  options?: CsvOptions
) => {
  if (!products?.length) return;

  const warehouseList: WarehouseProps[] | undefined = await getWarehousesFromSkusavvy();
  const warehouses = warehouseList?.length ? warehouseList : warehousesFromProducts(products);

  const csv = productListToCsv(products, warehouses, options);
  const filename = `felipapp-skusavvy-products-report-${new Date().toLocaleDateString("en-CA")}.csv`;

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
