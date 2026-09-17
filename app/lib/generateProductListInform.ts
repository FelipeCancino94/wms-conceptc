import { getProductList } from "./data/skusavvyFunctions";
import { downloadProductListReportCsv } from "./data/downloadProductListReportCsv";
import { PostSkusavvyProductReport } from "./data/postSkusavvyProductReport";

export async function generateProductListInform(reportId: string) {
  const productList = await getProductList();

  await downloadProductListReportCsv(productList?.data);

  if (productList !== undefined) {
    await PostSkusavvyProductReport(productList?.data, reportId);
  }

  return productList;
}