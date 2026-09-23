import "server-only";
import { neon } from "@neondatabase/serverless";

interface ProductReportRow {
  reportId: string;
  id: string;
  name: string;
  status: string;
  totalQuantity: number;
  variantId: string;
  sku: string;
  barcode: string;
  price: string;
  variantInventoryQuantity: number;
  variantCost: string;
  warehouses: {
    name: string;
    id: string;
    quantity: string;
    committedQuantity: number;
  }[];
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

const CHUNK_SIZE = 25;

async function upsertProduct(product: ProductReportRow) {
  const sql = db();

  try {
    await sql`
      INSERT INTO reports_products (
        report_id,
        name,
        status,
        total_quantity,
        variant_id,
        sku,
        barcode,
        price,
        variant_inventory_quantity,
        variant_cost,
        warehouses
      )
      VALUES (
        ${product.reportId},
        ${product.name},
        ${product.status},
        ${product.totalQuantity},
        ${product.variantId},
        ${product.sku},
        ${product.barcode},
        ${product.price},
        ${product.variantInventoryQuantity},
        ${product.variantCost},
        ${JSON.stringify(product.warehouses ?? [])}::jsonb
      ) returning report_id
    `;
    return { success: true, product };
  } catch (error) {
    return { success: false, product, error: String(error) };
  }
}

export async function insertProductListReport(products:ProductReportRow[]) {
  try {
    const failed: { product: ProductReportRow; error: string }[] = [];

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(chunk.map((product) => upsertProduct(product)));

      for (const r of results) {
        if (!r.success) {
          failed.push({ product: r.product, error: r.error || "Unknown error" });
        }
      }
    }

    return {
      success: failed.length === 0,
      count: products.length,
      failedCount: failed.length,
      failed,
    };

  } catch (error) {
    console.error(`[cron] failed insert products:`, error);
    return { success: false, data: String(error), status: 500 };
  }
}