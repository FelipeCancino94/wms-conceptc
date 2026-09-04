export type ProductProps = {
  id: number;
  shopify_id: string;
  title: string;
  image_url: string;
  vendor: string;
  product_type: string;
  updated_at: string;
  bin_max_quantity: number;
  bin_current_quantity: number;
  bin_location: string | string[];
  variants: VariantProps[];
  inventoryQuantity: number;
  inventory_quantity?:number;
  b_alias?: string | string[];
  _variantSku?: string;
  status?: string;
}

export type ProductItemProps = {
  id: string;
  title: string;
  variant_title: string;
  image_url: string;
  vendor: string;
  product_type: string;
  updated_at: string | undefined;
  bin_max_quantity: number;
  bin_current_quantity: number;
  bin_location: string | string[];
  inventory_quantity:number;
  b_alias: string | string[];
  status: string | undefined;
  sku: string;
  barcode: string;
  parent_id: string;
  expiration: boolean;
}

export type VariantProps = {
  variant_id: string;
  title: string;
  sku: string;
  barcode: string;
  inventoryQuantity: number;
  commitedInventory: number;
  __parentId: string;
}

export type SalesDataProps = {
  node: {
    id: string;
    number: number;
    lineItems: {
      edges: {
        node: {
          sku: string;
          quantity: number;
          product_title: string;
          variant: {
            sku: string;
          },
          product: {
            title: string;
          }
        }
      }[];
    }
  }
}

export type SummarizedItemProps = {
  sku: string;
  quantity: number;
  product_title: string;
}

export type SummarizedOrderProps = {
  orderShopifyId: string;
  orderId: number;
  items: SummarizedItemProps[];
}

export type SummarizedAccProps = {
  [sku: string]: {
    quantity: number;
    sku: string;
  }
}

export type ProductListProps = {
  sku: string;
  remaining: number;
  restock: number;
  id: string;
}

export type ProductListHistoricProps = {
  id: number;
  date: string;
  name: string;
  products: ProductListProps[];
}

export type ToastProps = {
  type: "info" | "success" | "error" | "warning";
  title: string;
  text: string;
}

export type ShopifyProductVariantsProps = {
  node: {
    id: string;
    title: string;
    sku: string;
    barcode: string;
    inventoryItem: {
      inventoryLevel: {
        quantities: {
          quantity: number
        }[]
      }
    }
  }
}

export type ShopifyProductProps = {
  node: {
    product: {
      id: string;
      title: string;
      media: {
        edges: {
          node: {
            preview: {
              image: {
                url: string
              }
            }
          }
        }[]
      };
      vendor: string;
      productType: string;
      variants: {
        edges: ShopifyProductVariantsProps[];
      };
    }
  }
}

export type DraftProductPayload = {
  sku: string;
  newStatus: string;
  updated_at: string;
}

export type ProductPayloadProps = {
  sku: string;
  updated_at: string;
  expiration?: boolean;
  status?: string;
}

export type DynamicQuery = (
  query: string,
  params: Array<string | number | boolean | null | Date>
) => Promise<unknown[]>;

export type MenuProps = {
  isOpen: boolean;
  onCloseMenu: () => void;
}

export type BinLocationsProps = {
  bins: BinContainerProps[];
  filteredBins: BinContainerProps[];
  setBin: (bin:BinContainerProps) => void;
  updateBin: (binId:string, available: boolean, stock_quantity: number) => void;
  updateSubBin: (binId:string, subBinId:string, available: boolean, stock_quantity: number) => void;
  filterBins: (value: boolean | null) => void;
}

export type BinProps = {
  id: string;
  available: boolean;
  stock_quantity: number;
}

export type BinContainerProps = {
  id: string;
  available: boolean;
  stock_quantity: number;
  bins: BinProps[];
}

export type OrdersDataProps = {
  node: {
    id: string;
    lineItems: {
      edges: {
        node: {
          customAttributes: {
            key: string;
            value: string;
          }[];
          product: {
            title: string;
          };
          quantity: number;
          variant: {
            sku: string;
            title: string;
            price: string;
          }
        }
      }[]
    }
    number: number;
  }
}

export type SelledProductsByUpsellProps = {
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  orderNumber: number;
  orderId: string;
  campaignId: string;
  productPrice: string;
}

export type UpsellCampaignProps = {
  name: string;
  id: string;
  color: string;
  begginingDate: string;
  campaignStatus: 'active' | 'draft';
}

export type UpsellSellCardProps = {
  campaignTitle: string;
  colorCard: string;
  data: SelledProductsByUpsellProps[];
  begginingDate: string;
}

export type DatePickerProps = {
  onPickerDate: (initialDate:string, finalDate:string) => void;
}

export type ProductExportProps = {
  sku: string;
  barcode: string;
  location: 'Entrepôt Québec';
  bin_location: string;
  bin_quantity: number;
  title: string;
}

export type BinItemProps = {
  id: string;
  available: boolean;
  bins?: {
    available: boolean;
    id: string;
    stock_quantity: number;
  }[];
}

export type BinLocationFormatProps = BinItemProps &{
  draders: {
    id: string;
    available: boolean;
  }[];
}

export type WmsBinLocationProps = {
  id: string;
  sku: string;
  bin_quantity: number | number[];
  bin_current_quantity?: number[];
};

export type BinItem = WmsBinLocationProps & {
  available: boolean;
  stock_quantity: number;
};

export type BinGroup = BinItem & {
  bins: BinItem[];
};

export type BinsToModifyProps = {
  id: string;
  sku: string;
  bin_quantity: string;
}

export type BinLocationProps = {
  id: string;
  sku: string[];
  bin_quantity: number[];
}

export type BinRenderProps = BinLocationProps & {
  bins: BinLocationProps[];
}

export type BinSectionsProps = {
  id: string;
  name: string;
  initialNumber: string;
}

export type BinColorStatus = {
  available: string;
  partialOccuped: string;
  occuped: string;
}

export type ProductsInSavedListProps = {
  id: string;
  sku: string;
  restock: number;
  remaining: number;
}

export type skusavvyProductQueryProps = {
  id: string;
  name: string;
  status:string;
  variants: {
    id: string;
    price: string;
    sku: string;
    totalQuantity: number;
    unitCosts: {
      cost: string;
    }[]
    inventory: {
      quantity: string;
      committedQuantity:number;
      warehouse: {
        id: string;
        name: string;
      }
    }[]
    inventoryItem: {
      weightedAvgCost: string;
    }
    committedQuantity:number;
  }[]
}

export type skusavvyDataByWarehousesProps = {
  id: string;
  name: string;
  totalProducts: number;
  totalPrice: number;
  totalCosts: number;
  totalCommitted: number;
}

export type skusavvyVariantProps = {
  id: string;
  price: string;
  sku: string;
  totalQuantity: number;
  unitCosts: {
    cost: string;
  }[]
  inventory: {
    quantity: string;
    warehouse: {
      id: string;
      name: string;
    }
  }[]
  inventoryItem: {
    weightedAvgCost: string;
  }
}

export type skusavvyProductProps = {
  id: string;
  name: string;
  status: string;
  variants: skusavvyVariantProps[];
}

export type WarehouseProps = {
  id: string;
  name: string;
}

export type SkusavvyFullReportProps = {
  warehouses: {
    id: string;
    name: string;
    totalProducts: string;
    totalPrice: string;
    totalCosts: string;
    totalCommitted: string;
  }[];
}

export type WarehouseReportWithLocalTime = warehouseReportByNeonProps & {
  localDate: string;
  localTime: string;
  localDateTime: string;
  timeZone: string;
  timeZoneLabel: string;
};

export type WarehouseReportGroup = {
  report_name: string;
  reports: WarehouseReportWithLocalTime[];
};

export type WarehouseReportRow = {
  id: number;
  created_at: Date;
  total_committed: string;
  total_costs: string;
  total_price: string;
  total_products: string;
  warehouse_id: string;
  warehouse_name: string;
};

export type warehouseReportByNeonProps = Omit<WarehouseReportRow, "created_at"> & {
  created_at: string; // ISO 8601 con Z
};

/* ------------------------------------------------------- */
/* APP V6 NEW TYPES -------------------------------------- */
/* ------------------------------------------------------- */