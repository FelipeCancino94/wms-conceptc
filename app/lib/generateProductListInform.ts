import { getProductList } from "./data/skusavvyFunctions";

export async function generateProductListInform() {
  const productList = await getProductList();
  return productList;
}