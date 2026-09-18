import { toast } from "sonner";
import type { ProductReport } from "../../types/types";

export const PostSkusavvyProductReport = async (report: ProductReport[], reportId: string) => {
  const params = {
    reportId: reportId,
    report
  }
  try {
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
      return;
    }

    const result = await response.json();

    toast.success(`Rapport de Skusavvy envoyé avec succès, produits obtenus: ${result.count}`, {
      position: 'top-center',
      richColors: true
    });

    if (result.success) {
      const responseChangeStatus = await fetch('/api/skusavvy-reports', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({reportId: reportId, status: 'completed'}),
      })

      if (!responseChangeStatus.ok) {
        toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${responseChangeStatus.statusText}`, {
          position: 'top-center',
          richColors: true
        })
        return;
      }

      const resultChangeStatus = await responseChangeStatus.json();

      toast.success(`Rapport de Skusavvy envoyé avec succès, produits obtenus: ${resultChangeStatus.count}`, {
        position: 'top-center',
        richColors: true
      });
    } else {
      const responseChangeStatus = await fetch('/api/skusavvy-reports', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({reportId: reportId, status: 'failed'}),
      })

      if (!responseChangeStatus.ok) {
        toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${responseChangeStatus.statusText}`, {
          position: 'top-center',
          richColors: true
        })
        return;
      }

      const resultChangeStatus = await responseChangeStatus.json();

      toast.error(`Rapport de Skusavvy refusé, produits obtenus: ${resultChangeStatus.count}`, {
        position: 'top-center',
        richColors: true
      });
    }

  } catch (error) {
    console.error("Error posting Skusavvy reports:", error);
  }
}