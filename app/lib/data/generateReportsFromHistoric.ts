import { downloadFullReportCsv } from "./exportReportsToCsv";

export async function generateReportsFromHistoric(reportId:string) {

  // GET WAREHOUSES DATA
  const warehousesRes = await fetch(`/api/neon/reports/warehouses?reportId=${reportId}`);

  if (!warehousesRes.ok) {
    throw new Error(`getHistoricReports HTTP ${warehousesRes.status}`);
  }
  
  const result = await warehousesRes.json();
  
  downloadFullReportCsv(result.data);

  // GET PRODUCT LIST DATA
  
  return result;
}