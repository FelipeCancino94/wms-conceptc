import { toast } from "sonner";

export async function getWarehousesFromSkusavvy() {
  try {
    const response = await fetch('/api/skusavvy/warehouses', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getInfoWarehouse(warehouseId: string | null) {
  try {
    const response = await fetch('/api/skusavvy/products', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({warehouseId})
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result.data;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getWeightedAvgCosts(warehouseId: string | null) {
  try {
    const response = await fetch('/api/skusavvy/weighted-avg-costs', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({warehouseId})
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result.data;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}

export async function getProductList() {
  try {
    const response = await fetch('/api/skusavvy/products-inform', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard.`, {
        position: 'top-center',
        richColors: true
      })
      return;
    }

    const result = await response.json()

    return result;
  } catch (error) {
    toast.error(`N'est pas possible d'ontenir l'information en ce moment, essayez plus tard. Error: ${error}`, {
      position: 'top-center',
      richColors: true
    })
    return;
  }
}