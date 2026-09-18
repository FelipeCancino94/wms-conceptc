import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

interface ProductReportRow {
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

const sql = neon(process.env.DATABASE_URL || "");
const CHUNK_SIZE = 25;

async function upsertProduct(product: ProductReportRow, reportId: number) {
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
        ${reportId},
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

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const reportId = Number(request.reportId);
    const products: ProductReportRow[] = request.report;

    if (!Number.isInteger(reportId)) {
      return NextResponse.json({ error: "Invalid reportId" }, { status: 400 });
    }
    const failed: { product: ProductReportRow; error: string }[] = [];

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(chunk.map((product) => upsertProduct(product, reportId)));

      for (const r of results) {
        if (!r.success) {
          failed.push({ product: r.product, error: r.error || "Unknown error" });
        }
      }
    }

    return NextResponse.json({
      success: failed.length === 0,
      count: products.length,
      failedCount: failed.length,
      failed,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

