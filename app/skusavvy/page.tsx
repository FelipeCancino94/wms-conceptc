"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getWarehousesFromSkusavvy, getInfoWarehouse, getWeightedAvgCosts } from "../lib/data/skusavvyFunctions";
import { type WarehouseProps } from "../types/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateWarehouseInform } from "../lib/generateWarehouseInform";
import { generateProductListInform } from "../lib/generateProductListInform";
import { generateReport } from "../lib/generateReport";
import { formatPrice } from "../lib/functions/formatPrice";
import HistoryReports from "../components/HistoricReports/HistoryReports";


const FADE_MS = 200;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function SkusavvyPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [contentVisible, setContentVisible] = useState<boolean>(true);

  const [warehouseList, setWarehouseList] = useState<WarehouseProps[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalCommitted, setTotalCommitted] = useState<number>(0);
  const [totalWeightedAvgCosts, setTotalWeightedAvgCosts] = useState<number>(0);

  const [loadingAllReport, setLoadingAllReport] = useState<boolean>(false);
  const [hideHistoryReports, setHideHistoryReports] = useState<boolean>(false);

  const getStats = async () => {
    setLoading(true);

    if (totalQuantity > 0) {
      setContentVisible(false);
      await wait(FADE_MS);
    }
    setContentVisible(true);

    const infoWarehouse = await getInfoWarehouse(selectedWarehouse);
    setTotalQuantity(infoWarehouse.totalQuantity);
    setTotalPrice(infoWarehouse.totalPrice);
    setTotalCommitted(infoWarehouse.totalCommitted);
    
    const infoWeightedAvgCosts = await getWeightedAvgCosts(selectedWarehouse);
    setTotalWeightedAvgCosts(infoWeightedAvgCosts.totalWeightedAvgCosts);

    setContentVisible(true);
    setLoading(false);
  }

  const getFullReport = async () => {
    setLoadingAllReport(true);
    setHideHistoryReports(true);

    const inform = await generateReport();
    const reportId = inform[0].id; // ID to send to anothers endpoints
    await generateWarehouseInform(reportId);
    await generateProductListInform(reportId);

    setLoadingAllReport(false);
    setHideHistoryReports(false);
  }

  useEffect(() => {
    const getWarehouses = async () => {
      const listOfWarehouses = await getWarehousesFromSkusavvy();
      setWarehouseList(listOfWarehouses);
    }

    getWarehouses();
  }, []);

  return (
    <main>
      <div className="skusavvy-page p-8! scheme-concept-c">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-start justify-start gap-4">
            {
              !loadingAllReport &&
                <>
                  {
                    warehouseList.length > 0 ?
                      <Select value={selectedWarehouse || undefined} onValueChange={setSelectedWarehouse}>
                        <SelectTrigger className="w-[180px] h-[43px]! bg-[rgb(var(--color-background-primary))]! border-1 border-[rgb(var(--color-base))] text-[rgb(var(--color-text))]! placeholder:text-[rgb(var(--color-text))]">
                          <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {warehouseList.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select> :
                      <Skeleton className="h-[43px] w-[180px] bg-[rgba(var(--color-base,.3))]" />
                  }
                  <Button
                    onClick={getStats}
                    className={`h-[43px]! ${ !selectedWarehouse || loading && 'disabled' }`}
                    disabled={!selectedWarehouse || loading}>
                      {
                        loading ?
                          <>
                            <Spinner className="size-6"/>
                            <span>Chargement...</span>
                          </>
                          :
                          <>
                            <span className="h-[21px] flex items-center">Obtenir rapport de Skusavvy</span>
                          </>
                      }
                  </Button>
                </>
            }
          </div>
          <div className="flex justify-end items-center gap-4">
            <Button
              className={`h-[43px]! ${ loadingAllReport && 'disabled' }`}
              disabled={loadingAllReport}
              onClick={getFullReport}>
              {
                loadingAllReport ?
                  <>
                    <Spinner className="size-6"/>
                    <span>Chargement...</span>
                  </>
                  :
                  <>
                    <span className="h-[21px] flex items-center">Obtenir tout le rapport le plus récent</span>
                  </>
              }
            </Button>
          </div>
        </div>
        <div
          className={`warehouses-container flex flex-col gap-4 justify-center items-center py-4! transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            contentVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2 motion-reduce:translate-y-0'
          }`}>
          {
            loading ?
              <div className="flex flex-col w-full gap-4 skeleton-loaders">
                <Card className="w-full">
                  <CardHeader>
                    <Skeleton className="h-8 w-75" />
                  </CardHeader>
                  <CardContent className="flex items-center justify-around gap-4">
                    <Skeleton className="w-full h-24 aspect-video" />
                    <Skeleton className="w-full h-24 aspect-video" />
                    <Skeleton className="w-full h-24 aspect-video" />
                    <Skeleton className="w-full h-24 aspect-video" />
                  </CardContent>
                </Card>
              </div>
            :
              totalQuantity > 0 &&
                <Card className="w-full warehouse-card">
                  <CardHeader>
                    <p className="text-2xl">{ warehouseList.find((w) => w.id === selectedWarehouse)?.name }</p>
                  </CardHeader>
                  <CardContent className="flex items-center justify-around gap-4">
                    <div className="info-item rounded-lg shadow-md  p-4! w-full">
                      <p>Total items</p>
                      <p className="text-3xl text-center">{ totalQuantity }</p>
                    </div>
                    <div className="info-item rounded-lg shadow-md  p-4! w-full">
                      <p>Total retail</p>
                      <p className="text-3xl text-center">
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                    <div className="info-item rounded-lg shadow-md  p-4! w-full">
                      <p>Total cost</p>
                      <p className="text-3xl text-center">
                        {formatPrice(totalWeightedAvgCosts)}
                      </p>
                    </div>
                    <div className="info-item rounded-lg shadow-md  p-4! w-full">
                      <p>Total Commited</p>
                      <p className="text-3xl text-center">
                        {formatPrice(totalCommitted)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
          }
        </div>
        {
          !hideHistoryReports && <HistoryReports />
        }
      </div>
    </main>
  )
}