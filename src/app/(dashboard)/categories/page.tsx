import { getCategories } from "@/actions/categories";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={JSON.parse(JSON.stringify(categories))} />;
}
