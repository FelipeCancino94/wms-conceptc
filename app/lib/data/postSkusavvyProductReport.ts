import { toast } from "sonner";
import type { ProductReport } from "../../types/types";

// Products per request, so each body stays far below the serverless limit ("Content too large")
const CHUNK_SIZE = 500;

export const updateReportStatus = async (reportId: string, status: 'completed' | 'failed') => {
  try {
    const response = await fetch('/api/skusavvy-reports', {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reportId, status }),
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${response.statusText}`, {
        position: 'top-center',
        richColors: true
      })
    }

    return response.ok;
  } catch (error) {
    console.error("Error updating Skusavvy report status:", error);
    return false;
  }
}

export const PostSkusavvyProductReport = async (report: ProductReport[], reportId: string) => {
  try {
    let count = 0;
    let failedCount = 0;

    for (let i = 0; i < report.length; i += CHUNK_SIZE) {
      const params = {
        reportId: reportId,
        report: report.slice(i, i + CHUNK_SIZE)
      }

      const response = await fetch("/api/skusavvy-reports/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${response.statusText}`, {
          position: 'top-center',
          richColors: true
        })
        await updateReportStatus(reportId, 'failed');
        return;
      }

      const result = await response.json();
      count += result.count;
      failedCount += result.failedCount;
    }

    // The report status is set once, after every chunk has been saved
    if (failedCount === 0) {
      await updateReportStatus(reportId, 'completed');

      toast.success(`Rapport de Skusavvy envoyé avec succès, produits obtenus: ${count}`, {
        position: 'top-center',
        richColors: true
      });
    } else {
      await updateReportStatus(reportId, 'failed');

      toast.error(`Rapport de Skusavvy refusé, produits non enregistrés: ${failedCount}/${count}`, {
        position: 'top-center',
        richColors: true
      });
    }

  } catch (error) {
    console.error("Error posting Skusavvy reports:", error);
    await updateReportStatus(reportId, 'failed');
  }
}
