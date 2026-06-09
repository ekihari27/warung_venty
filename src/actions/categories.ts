"use server";

import { DataService } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await DataService.getCategories();
}

export async function createCategory(formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Nama kategori harus diisi");

  const category = await DataService.createCategory({
    name,
    description: description || undefined,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Tambah Kategori",
    details: `Kategori "${name}" ditambahkan.`,
  });

  revalidatePath("/categories");
  revalidatePath("/products");
  return category;
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const category = await DataService.updateCategory(id, {
    name,
    description: description || undefined,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Edit Kategori",
    details: `Kategori "${name}" diperbarui.`,
  });

  revalidatePath("/categories");
  revalidatePath("/products");
  return category;
}

export async function deleteCategory(id: string) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  await DataService.deleteCategory(id);

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Hapus Kategori",
    details: `Kategori ID ${id} dihapus.`,
  });

  revalidatePath("/categories");
  revalidatePath("/products");
}
