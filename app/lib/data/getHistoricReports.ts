import type { ReportProps } from "@/app/types/types";

export async function getHistoricReports(
  initialDate: string, // "YYYY-MM-DD"
  finalDate: string    // "YYYY-MM-DD"
): Promise<ReportProps[]> {
  const params = new URLSearchParams({ initialDate, finalDate });
  const res = await fetch(`/api/skusavvy-reports?${params}`);

  if (!res.ok) {
    throw new Error(`getHistoricReports HTTP ${res.status}`);
  }

  const json: { data: ReportProps[] } = await res.json();

  return json.data ? json.data.filter(key => key.status === "completed") : [];
}