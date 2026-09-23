import { fetchProductList } from "./fetchProductList";
import { insertProductListReport } from "../neon/insertProductListReport";

interface ProductReportPage {
  data: ProductReport[];
  nextOffset: number | null;
  waitTimeInSeconds: number;
}

interface ProductReport {
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

export async function cronCreateProductListReport(reportId: string) {

  try {
    const products: ProductReport[] = [];
    let offset: number | null = 0;

    while (offset !== null) {
      const response = await fetchProductList(offset, reportId);

      const result: ProductReportPage = await response.data;

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