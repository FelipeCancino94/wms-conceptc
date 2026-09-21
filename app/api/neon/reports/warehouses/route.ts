import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { WarehouseReportRow } from "@/app/types/types";

const sql = neon(process.env.DATABASE_URL || "");

interface ReportWarehouseToCsvProps {
  warehouses: {
    id: string;
    name: string;
    totalProducts: string;
    totalPrice: string;
    totalCosts: string;
    totalCommitted: string;
  }[]
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
      SELECT warehouse_id, warehouse_name, total_products, total_price, total_costs, total_committed
      FROM reports_warehouses
      WHERE report_id = ${reportId}
      ORDER BY warehouse_name
    `) as Omit<WarehouseReportRow, "id" | "created_at">[];

    const reportWarehouses: ReportWarehouseToCsvProps = { warehouses: [] };

    response.forEach((row) => {
      const warehouse = {
        id: row.warehouse_id,
        name: row.warehouse_name,
        totalProducts: row.total_products,
        totalPrice: row.total_price,
        totalCosts: row.total_costs,
        totalCommitted: row.total_committed
      }

      reportWarehouses.warehouses.push(warehouse);
    });

    return NextResponse.json({ data: reportWarehouses }, { status: 200 });

  } catch (error) {
    console.error("Error getting warehouses report: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}