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

  } catch (error) {
    console.error("Error posting Skusavvy reports:", error);
  }
}