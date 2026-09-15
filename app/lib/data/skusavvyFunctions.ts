import { toast } from "sonner";
import type { ProductReport, ProductReportPage } from "@/app/types/types";

export async function getWarehousesFromSkusavvy() {
  try {
    const response = await fetch('/api/skusavvy/warehouses', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result;
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
    const response = await fetch('/api/skusavvy/products', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({warehouseId})
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result.data;
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
    const response = await fetch('/api/skusavvy/weighted-avg-costs', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({warehouseId})
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result.data;
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
    let offset: number | null = 0;

    // The route returns the catalog in chunks; keep calling until there is no next offset,
    // waiting when SkuSavvy's rate limit asks us to
    while (offset !== null) {
      const response = await fetch('/api/skusavvy/products-inform', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offset }),
      })

      if (!response.ok) {
        toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
          position: 'top-center',
          richColors: true
        })
        return;
      }

      const result: ProductReportPage = await response.json()

      products.push(...result.data);
      offset = result.nextOffset;

      if (offset !== null && result.waitTimeInSeconds > 0) {
        await new Promise((r) => setTimeout(r, (result.waitTimeInSeconds + 1) * 1000));
      }
    }

    return { data: products };
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}