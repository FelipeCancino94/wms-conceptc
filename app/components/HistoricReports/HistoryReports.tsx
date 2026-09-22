import { useCallback, useState } from "react";
import { getHistoricReports } from "@/app/lib/data/getHistoricReports";
// import { groupReportsByDate } from "@/app/lib/functions/groupReportsByDate";
import type { ReportProps } from "@/app/types/types";
import Loading from "../Loading/Loading";
import DatePicker from "../DatePicker/DatePicker";
import './HistoryReports.css';
import { generateReportsFromHistoric } from "@/app/lib/data/generateReportsFromHistoric";

const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const REPORT_TZ = "America/Toronto";

const dateUtcToLocalDate = (utcDate:Date | string) => {
  const date = typeof utcDate === "string"
    ? new Date(utcDate.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"))
    : utcDate;

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date).replace(",", "");
}

export default function HistoryReports() {
  const [reportsList, setReportsList] = useState<ReportProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [datePickerInitialDate, setDatePickerInitialDate] = useState<string>('');
  const [datePickerFinalDate, setDatePickerFinalDate] = useState<string>('');

  const handlePickerDate = useCallback((initialDate:string, finalDate:string) => {
    setDatePickerInitialDate(toYMD(new Date(initialDate)));
    setDatePickerFinalDate(toYMD(new Date(finalDate)));
  },[]);

  async function getReportsData() {
    setLoading(true);
    try {
      const reports = await getHistoricReports(datePickerInitialDate, datePickerFinalDate);
      setReportsList(reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function getWarehouseAndProductListData(reportId:string, reportDate:string) {
    generateReportsFromHistoric(reportId, reportDate);
  }

  return (
    <div className="historic-reports">
      <h1 className="text-3xl">Historique des rapports</h1>
      <div className="flex justify-start items-center gap-4 mt-4!">
        <DatePicker onPickerDate={handlePickerDate} />
        <button className="h-[43px]! rounded-lg" onClick={() => getReportsData()}>Chercher rappports</button>
      </div>
      {
        loading ? <Loading /> :
          <div className="reports-list mt-4!">
            {
              reportsList.length > 0 ?
                reportsList.map((report:ReportProps, index:number) => (
                  <div className="report flex justify-between items-center gap-4 odd:bg-[rgba(var(--color-base),.3)] pl-4" key={index}>
                    <div className="text-xl">Rapport du { dateUtcToLocalDate(report.created_at) }</div>
                    <button
                      className="h-[43px]!"
                      onClick={() => getWarehouseAndProductListData(report.id, dateUtcToLocalDate(report.created_at))}>
                        Exporter reports en .CSV
                    </button>
                  </div>
                )) :
                <p className="text-xl">Il n&apos;y a pas de rapports pour cette période.</p>
            }
          </div>
      }
    </div>
  )
}