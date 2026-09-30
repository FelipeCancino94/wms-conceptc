import { getProductList } from "./data/skusavvyFunctions";
import { downloadProductListReportCsv } from "./data/downloadProductListReportCsv";
import { PostSkusavvyProductReport, updateReportStatus } from "./data/postSkusavvyProductReport";

export async function generateProductListInform(reportId: string) {
  const productList = await getProductList();

  await downloadProductListReportCsv(productList?.data);

  if (productList !== undefined) {
    await PostSkusavvyProductReport(productList.data, reportId);
  } else {
    // The product list could not be fetched, so the report must not stay pending
    await updateReportStatus(reportId, 'failed');
  }

  return productList;
}
