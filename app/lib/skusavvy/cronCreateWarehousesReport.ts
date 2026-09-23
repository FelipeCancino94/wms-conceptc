import { fetchWarehouses } from "./warehouses";
import { fetchInfoWarehouses } from "./infoWarehouses";
import { fetchWeightedAvgCosts } from "./weightedAvgCosts";
import { formatPrice } from "../functions/formatPrice";
import { insertWarehouseReport } from "../neon/insertWarehouseReport";

interface SkusavvyFullReportProps {
  warehouses: {
    reportId: string;
    id: string;
    name: string;
    totalProducts: string;
    totalPrice: string;
    totalCosts: string;
    totalCommitted: string;
  }[];
}

export async function cronCreateWarehousesReport(reportId:string) {

  const report:SkusavvyFullReportProps = {
    warehouses: [],
  }

  const getAllWarehouses = await fetchWarehouses();

  if (getAllWarehouses) {
    for (const warehouse of getAllWarehouses) {
      const warehouseObject = {
        reportId: reportId,
        id: warehouse.id,
        name: warehouse.name,
        totalProducts: "0",
        totalPrice: "0",
        totalCosts: "0",
        totalCommitted: "0",
      };

      report.warehouses.push(warehouseObject);

      const getStatsFromWarehouse = await fetchInfoWarehouses(warehouse.id);

      if (getStatsFromWarehouse) {
        const warehouseFinded = report.warehouses.find((w) => w.id === warehouse.id);
        if (warehouseFinded) {
          warehouseFinded.totalProducts = getStatsFromWarehouse.totalQuantity.toString();
          warehouseFinded.totalPrice = formatPrice(getStatsFromWarehouse.totalPrice);
          warehouseFinded.totalCommitted = formatPrice(getStatsFromWarehouse.totalCommitted);
        }
      }

      const getWeightedAvgCostsFromWarehouse = await fetchWeightedAvgCosts(warehouse.id);

      if (getWeightedAvgCostsFromWarehouse) {
        const warehouseFinded = report.warehouses.find((w) => w.id === warehouse.id);
        if (warehouseFinded) {
          warehouseFinded.totalCosts = formatPrice(getWeightedAvgCostsFromWarehouse.totalWeightedAvgCosts);
        }
      }
    }
  }

  const result = await insertWarehouseReport(report);
  if (!result.success) {
    throw new Error(`${result.failedCount}/${result.count} inserts fallaron`);
  }
  return result;
}