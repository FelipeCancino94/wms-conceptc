import { createReport, updateReport } from "./neon/createReport";
import { cronCreateWarehousesReport } from "./skusavvy/cronCreateWarehousesReport";
import { cronCreateProductListReport } from "./skusavvy/cronCreateProductListReport";

export async function CronReports() {
  
  // CREATE INITIAL REPORT -> with pending status
  const report = await createReport();
  let reportId = '';
  // let reportDate = '';
  
  if (!Array.isArray(report.data)) {
    throw new Error('Error trying get report ID or ReportDate');
  }

  reportId = report.data[0]?.id;
  // reportDate = report.data[0]?.created_at;

  // CREATE WAREHOUSE REPORT
  await cronCreateWarehousesReport(reportId);

  // CREATE PRODUCT LIST REPORT
  await cronCreateProductListReport(reportId);

  // CHANGE REPORT STATUS
  await updateReport(reportId);

  return {success: true, status: 200}
}