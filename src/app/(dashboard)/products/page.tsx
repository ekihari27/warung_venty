import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/categories";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return (
    <ProductsClient
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
