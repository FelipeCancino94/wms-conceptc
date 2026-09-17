import { toast } from "sonner";

export async function generateReport() {
  try {
    const response = await fetch("/api/skusavvy-reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${response.statusText}`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json();
    toast.success(`Rapport de Skusavvy a commencé avec succès date: ${result[0].created_at}`, {
      position: 'top-center',
      richColors: true
    });
    return result;

  } catch (error) {
    console.error("Error posting Skusavvy reports:", error);
  }
}