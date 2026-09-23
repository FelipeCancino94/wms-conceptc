import "server-only";
import { neon } from "@neondatabase/serverless";

interface warehouseReportRow {
  reportId: string;
  id: string;
  name: string;
  totalProducts: string;
  totalPrice: string;
  totalCosts: string;
  totalCommitted: string;
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

const CHUNK_SIZE = 25;

async function upsertWarehouse(warehouse: warehouseReportRow) {
  const sql = db();

  try {
    await sql`
      INSERT INTO reports_warehouses (
        report_id
        warehouse_id,
        warehouse_name,
        total_products,
        total_price,
        total_costs,
        total_committed,
        created_at
      )
      VALUES (
        ${warehouse.reportId},
        ${warehouse.id},
        ${warehouse.name},
        ${warehouse.totalProducts},
        ${warehouse.totalPrice},
        ${warehouse.totalCosts},
        ${warehouse.totalCommitted},
        NOW()
      ) returning id
    `;
    return { success: true, warehouse };
  } catch (error) {
    console.error(`[cron] failed insert warehouse ${warehouse.id}:`, error);
    return { success: false, warehouse, error: String(error) };
  }
}

export async function insertWarehouseReport(report: { warehouses: warehouseReportRow[] }) {
  const warehouses: warehouseReportRow[] = report.warehouses;
  const failed: { warehouse: warehouseReportRow; error: string }[] = [];

  for (let i = 0; i < warehouses.length; i += CHUNK_SIZE) {
    const chunk = warehouses.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(chunk.map(upsertWarehouse));

    for (const r of results) {
      if (!r.success) {
        failed.push({ warehouse: r.warehouse, error: r.error || "Unknown error" });
      }
    }
  }

  return {
    success: failed.length === 0,
    count: warehouses.length,
    failedCount: failed.length,
    failed,
  };
}