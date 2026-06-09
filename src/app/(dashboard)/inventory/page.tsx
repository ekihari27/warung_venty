import { getProducts } from "@/actions/products";
import { getSuppliers } from "@/actions/suppliers";
import { getStockBatches, getStockMovements } from "@/actions/inventory";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const [products, suppliers, batches, movements] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getStockBatches(),
    getStockMovements(),
  ]);

  return (
    <InventoryClient
      products={JSON.parse(JSON.stringify(products))}
      suppliers={JSON.parse(JSON.stringify(suppliers))}
      batches={JSON.parse(JSON.stringify(batches))}
      movements={JSON.parse(JSON.stringify(movements))}
    />
  );
}
