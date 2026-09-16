import { getProductList } from "./data/skusavvyFunctions";
import { downloadProductListReportCsv } from "./data/downloadProductListReportCsv";

export async function generateProductListInform() {
  const productList = await getProductList();
  
  await downloadProductListReportCsv(productList?.data);

  return productList;
}