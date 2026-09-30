import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

export async function POST(req:Request) {
  const body = await req.json().catch(() => ({}));
  const WAREHOUSE_ID = body?.warehouseId;
  const startOffset = Number(body?.offset ?? 0);

  if (!Number.isInteger(startOffset) || startOffset < 0) {
    return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  }

  const QUERY = `
    query InventoryTotals($limit: Int, $offset: Int) {
      inventoryItems(limit: $limit, offset: $offset) {
        totalQuantity(warehouseId: "${WAREHOUSE_ID}")
        variants {
          price
          committedQuantity(warehouseId: "${WAREHOUSE_ID}")
        }
      }
    }
  `;
  const session = await auth();

  if (!session?.user?.canAccessSkusavvy) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let totalQuantity = 0;
    let totalPrice = 0;
    let totalCommitted = 0;
    const startedAt = Date.now();
    let offset = startOffset;

    // Totals only cover the pages read in this request; the client sums them across calls
    const respond = (nextOffset: number | null, waitTimeInSeconds = 0) =>
      NextResponse.json(
        { data: { totalQuantity, totalPrice, totalCommitted }, nextOffset, waitTimeInSeconds },
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
          return respond(offset, Math.max(1, rateLimit.extensions?.cost?.waitTimeInSeconds ?? 60));
        }

        return NextResponse.json({ error: json.errors }, { status: 400 });
      }

      const batch: Array<{ totalQuantity: number, variants: Array<{ price: string, committedQuantity: number }> }> = json?.data?.inventoryItems ?? [];

      for (const item of batch) {
        totalQuantity += Number(item?.totalQuantity) || 0;
        totalPrice += item?.variants?.reduce((sum, variant) => sum + (Number(variant?.price) * Number(item?.totalQuantity) || 0), 0) || 0;
        totalCommitted += item?.variants?.reduce((sum, variant) => sum + (Number(variant?.price) * Number(variant?.committedQuantity) || 0), 0) || 0;
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
