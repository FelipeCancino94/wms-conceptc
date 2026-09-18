import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { ProductReportRow, ProductReport, ProductReportPage } from "@/app/types/types";

const baseUrl = process.env.SKUSAVVY_BASE_URL || "";
const apiKey = process.env.SKUSAVVY_API_KEY || "";

export const maxDuration = 60;

const PAGE_SIZE = 100;
// Stop fetching before maxDuration so the response always gets back to the client
const TIME_BUDGET_MS = 45_000;

type GraphQLError = {
  message: string;
  extensions?: {
    cost?: {
      success: boolean;
      waitTimeInSeconds: number;
    };
  };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const startOffset = Number(body?.offset ?? 0);

  if (!Number.isInteger(startOffset) || startOffset < 0) {
    return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  }

  const QUERY = `
    query ProductList($limit: Int, $offset: Int) {
      variants(limit: $limit, offset: $offset) {
        id
        sku
        price
        totalQuantity
        product {
          name
          status
        }
        inventoryItem {
          barcodes(limit: 1) {
            value
          }
          weightedAvgCost
        }
        inventory {
          committedQuantity
          quantity
          warehouseId
        }
      }
    }
  `;
  const session = await auth();

  if (!session?.user?.canAccessSkusavvy) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const productReportList: ProductReport[] = [];
    const startedAt = Date.now();
    let offset = startOffset;

    const respond = (nextOffset: number | null, waitTimeInSeconds = 0) =>
      NextResponse.json<ProductReportPage>(
        { data: productReportList, nextOffset, waitTimeInSeconds },
        { status: 200 }
      );

    for (let page = 0; page < 1000; page++) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        return respond(offset);
      }

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": apiKey,
        },
        body: JSON.stringify({
          query: QUERY,
          variables: { limit: PAGE_SIZE, offset },
        }),
        cache: "no-store",
      });

      const json = await res.json();

      if (json.errors) {
        const rateLimit = (json.errors as GraphQLError[]).find(
          (error) => error.extensions?.cost?.success === false
        );

        // Rate limited: hand back what we have so the client waits and resumes from this offset
        if (rateLimit) {
          return respond(offset, rateLimit.extensions?.cost?.waitTimeInSeconds ?? 60);
        }

        return NextResponse.json({ error: json.errors }, { status: 400 });
      }

      const batch: Array<ProductReportRow> = json?.data.variants ?? [];

      for (const item of batch) {
        const product = {
          id: item.id,
          name: item.product.name,
          status: item.product.status,
          totalQuantity: item.totalQuantity,
          variantInventoryQuantity: item.totalQuantity,
          variantId: item.id,
          sku: item.sku,
          barcode: item.inventoryItem.barcodes[0]?.value || 'not founded',
          price: item.price,
          variantCost: item.inventoryItem.weightedAvgCost,
          warehouses: item.inventory.map((warehouse) => ({
            name: warehouse.warehouseId, // cambiar por el nombre del warehouse, crear funcion para obtenerlo aparte
            id: warehouse.warehouseId,
            quantity: warehouse.quantity,
            committedQuantity: warehouse.committedQuantity
          })),
        }

        productReportList.push(product);
      }

      if (batch.length < PAGE_SIZE) break;

      offset += batch.length;
      await sleep(150);
    }

    return respond(null);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
