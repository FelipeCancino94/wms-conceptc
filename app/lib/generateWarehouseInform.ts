import { type SkusavvyFullReportProps } from "../types/types";
import { getWarehousesFromSkusavvy, getInfoWarehouse, getWeightedAvgCosts } from "./data/skusavvyFunctions";
import { formatPrice } from "./functions/formatPrice";
import { downloadFullReportCsv } from "./data/exportReportsToCsv";
import { PostSkusavvyReports } from "./data/postSkusavvyReports";

export async function generateWarehouseInform(reportId: string) {
  const report:SkusavvyFullReportProps = {
    warehouses: [],
  }

  const getAllWarehouses = await getWarehousesFromSkusavvy();

  if (getAllWarehouses) {
    for (const warehouse of getAllWarehouses) {
      const warehouseObject = {
        id: warehouse.id,
        name: warehouse.name,
        totalProducts: "0",
        totalPrice: "0",
        totalCosts: "0",
        totalCommitted: "0",
      };

      report.warehouses.push(warehouseObject);

      const getStatsFromWarehouse = await getInfoWarehouse(warehouse.id);
      if (getStatsFromWarehouse) {
        const warehouseFinded = report.warehouses.find((w) => w.id === warehouse.id);
        if (warehouseFinded) {
          warehouseFinded.totalProducts = getStatsFromWarehouse.totalQuantity;
          warehouseFinded.totalPrice = formatPrice(getStatsFromWarehouse.totalPrice);
          warehouseFinded.totalCommitted = formatPrice(getStatsFromWarehouse.totalCommitted);
        }
      }

      const getWeightedAvgCostsFromWarehouse = await getWeightedAvgCosts(warehouse.id);
      if (getWeightedAvgCostsFromWarehouse) {
        const warehouseFinded = report.warehouses.find((w) => w.id === warehouse.id);
        if (warehouseFinded) {
          warehouseFinded.totalCosts = formatPrice(getWeightedAvgCostsFromWarehouse.totalWeightedAvgCosts);
        }
      }
    }
  }

  downloadFullReportCsv(report);
  await PostSkusavvyReports(report, reportId);
}