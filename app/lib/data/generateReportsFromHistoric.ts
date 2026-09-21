import { downloadFullReportCsv } from "./exportReportsToCsv";
import { downloadProductListReportCsv } from "./downloadProductListReportCsv";

export async function generateReportsFromHistoric(reportId:string) {

  // GET WAREHOUSES DATA
  const warehousesRes = await fetch(`/api/neon/reports/warehouses?reportId=${reportId}`);

  if (!warehousesRes.ok) {
    throw new Error(`get warehouse Reports HTTP ${warehousesRes.status}`);
  }
  
  const result = await warehousesRes.json();
  
  downloadFullReportCsv(result.data);

  // GET PRODUCT LIST DATA
  
  const productListRes = await fetch(`/api/neon/reports/products?reportId=${reportId}`);

  if (!productListRes.ok) {
    throw new Error(`get product list reports HTTP ${warehousesRes.status}`);
  }

  const productResult = await productListRes.json();

  downloadProductListReportCsv(productResult.data)

  return result;
}