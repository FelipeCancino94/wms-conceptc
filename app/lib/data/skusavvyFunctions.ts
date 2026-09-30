import { toast } from "sonner";
import type { ProductReport } from "@/app/types/types";

type WarehouseTotals = {
  totalQuantity: number;
  totalPrice: number;
  totalCommitted: number;
};

type WeightedAvgCostsTotals = {
  totalWeightedAvgCosts: number;
};

type ResumablePage<T> = {
  data: T;
  nextOffset: number | null;
  waitTimeInSeconds: number;
};

// Consecutive responses without progress (still rate limited) before giving up
const MAX_STALLED_REQUESTS = 10;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The routes answer before their own timeout or as soon as SkuSavvy rate limits them,
// so keep calling until there is no next offset, waiting whenever the rate limit asks us to
async function fetchAllPages<T>(
  url: string,
  body: Record<string, unknown>,
  onPage: (data: T) => void
) {
  let offset: number | null = 0;
  let stalledRequests = 0;

  while (offset !== null) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...body, offset }),
    })

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const result: ResumablePage<T> = await response.json()

    onPage(result.data);

    stalledRequests = result.nextOffset === offset ? stalledRequests + 1 : 0;
    if (stalledRequests > MAX_STALLED_REQUESTS) {
      throw new Error("SkuSavvy rate limit did not recover");
    }

    offset = result.nextOffset;

    if (offset !== null && result.waitTimeInSeconds > 0) {
      await sleep((result.waitTimeInSeconds + 1) * 1000);
    }
  }
}

export async function getWarehousesFromSkusavvy() {
  try {
    for (let attempt = 0; attempt <= MAX_STALLED_REQUESTS; attempt++) {
      const response = await fetch('/api/skusavvy/warehouses', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
      })

      // Rate limited: wait the time SkuSavvy asks for and try again
      if (response.status === 429) {
        const { waitTimeInSeconds } = await response.json();
        await sleep(((Number(waitTimeInSeconds) || 0) + 1) * 1000);
        continue;
      }

      if (!response.ok) {
        toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
          position: 'top-center',
          richColors: true
        })
        return;
      }

      const result = await response.json()

      return result;
    }

    throw new Error("SkuSavvy rate limit did not recover");
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getInfoWarehouse(warehouseId: string | null) {
  try {
    const totals: WarehouseTotals = { totalQuantity: 0, totalPrice: 0, totalCommitted: 0 };

    // Each response only covers part of the inventory, so the totals are summed here
    await fetchAllPages<WarehouseTotals>('/api/skusavvy/products', { warehouseId }, (page) => {
      totals.totalQuantity += page.totalQuantity;
      totals.totalPrice += page.totalPrice;
      totals.totalCommitted += page.totalCommitted;
    });

    return totals;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getWeightedAvgCosts(warehouseId: string | null) {
  try {
    const totals: WeightedAvgCostsTotals = { totalWeightedAvgCosts: 0 };

    await fetchAllPages<WeightedAvgCostsTotals>('/api/skusavvy/weighted-avg-costs', { warehouseId }, (page) => {
      totals.totalWeightedAvgCosts += page.totalWeightedAvgCosts;
    });

    return totals;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getProductList() {
  try {
    const products: ProductReport[] = [];

    await fetchAllPages<ProductReport[]>('/api/skusavvy/products-inform', {}, (page) => {
      products.push(...page);
    });

    return { data: products };
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}
