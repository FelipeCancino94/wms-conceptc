import type { ProductReportToInsert } from "@/app/types/types";
import { fetchProductList } from "./fetchProductList";
import { insertProductListReport } from "../neon/insertProductListReport";

export async function cronCreateProductListReport(reportId: string) {

  try {
    const products: ProductReportToInsert[] = [];
    let offset: number | null = 0;

    while (offset !== null) {
      const result = await fetchProductList(offset, reportId);

      if (!result.success) {
        throw new Error(
          `fetchProductList failed (status ${result.status}): ` +
            JSON.stringify(result.data ?? null)
        );
      }

      products.push(...result.data);
      offset = result.nextOffset;

      if (offset !== null && result.waitTimeInSeconds > 0) {
        await new Promise((r) => setTimeout(r, (result.waitTimeInSeconds + 1) * 1000));
      }
    }

    await insertProductListReport(products);

    return { success:true, data: products };

  } catch(error) {
    console.error(`[cron] failed to create initial report`, error);
    return { success: false, data: null, error: String(error) }
  }
}