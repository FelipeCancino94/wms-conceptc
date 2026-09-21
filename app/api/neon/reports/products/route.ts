import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { ReportListRow, ReportWarehouseEntry } from "@/app/types/types";

const sql = neon(process.env.DATABASE_URL || "");

interface ReportProductListToCsvProps {
  id: string;
  variantId: string;
  sku: string;
  barcode: string;
  name: string;
  status: string;
  price: string;
  variantCost: string;
  totalQuantity: number;
  variantInventoryQuantity: number;
  warehouses: ReportWarehouseEntry[];
}

function parseWarehouses(
  value: ReportListRow["warehouses"]
): ReportWarehouseEntry[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing warehouses column: ", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawReportId = searchParams.get("reportId");
  const reportId = Number(rawReportId);

  if (!rawReportId || !Number.isInteger(reportId)) {
    return NextResponse.json(
      { error: "reportId is required" },
      { status: 400 }
    );
  }

  try {
    const response = (await sql`
      SELECT name, status, total_quantity, variant_id, sku, barcode, price, variant_inventory_quantity, variant_cost, warehouses, id
      FROM reports_products
      WHERE report_id = ${reportId}
      ORDER BY id
    `) as Omit<ReportListRow, "report_id" | "created_at">[];

    const reportProductList: ReportProductListToCsvProps[] = [];

    response.forEach((row) => {
      const item: ReportProductListToCsvProps = {
        id: row.variant_id,
        variantId: row.variant_id,
        sku: row.sku,
        barcode: row.barcode,
        name: row.name,
        status: row.status,
        price: row.price,
        variantCost: row.variant_cost,
        totalQuantity: row.total_quantity,
        variantInventoryQuantity: row.variant_inventory_quantity,
        warehouses: parseWarehouses(row.warehouses),
      }

      reportProductList.push(item);
    });

    return NextResponse.json({ data: reportProductList }, { status: 200 });

  } catch (error) {
    console.error("Error getting warehouses report: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}