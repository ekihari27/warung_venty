"use server";

import { DataService } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  return await DataService.getSuppliers();
}

export async function createSupplier(formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  if (!name) throw new Error("Nama supplier harus diisi");

  const supplier = await DataService.createSupplier({
    name,
    address: address || undefined,
    phone: phone || undefined,
    email: email || undefined,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Tambah Supplier",
    details: `Supplier "${name}" ditambahkan.`,
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, formData: FormData) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  const supplier = await DataService.updateSupplier(id, {
    name,
    address: address || undefined,
    phone: phone || undefined,
    email: email || undefined,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Edit Supplier",
    details: `Supplier "${name}" diperbarui.`,
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  await DataService.deleteSupplier(id);

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Hapus Supplier",
    details: `Supplier ID ${id} dihapus.`,
  });

  revalidatePath("/suppliers");
}
