"use server";

import { DataService } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStockBatches(productId?: string) {
  return await DataService.getStockBatches(productId);
}

export async function getStockMovements(productId?: string) {
  return await DataService.getStockMovements(productId);
}

export async function addStockIn(data: {
  productId: string;
  supplierId?: string;
  qty: number;
  purchasePrice: number;
  description?: string;
}) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const batch = await DataService.addStockIn({
    productId: data.productId,
    supplierId: data.supplierId,
    qty: data.qty,
    purchasePrice: data.purchasePrice,
    description: data.description,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Barang Masuk",
    details: `Produk ${data.productId}: +${data.qty} pcs @ Rp ${data.purchasePrice}`,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/pos");
  return batch;
}

export async function addStockOut(data: {
  productId: string;
  qty: number;
  description?: string;
}) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const usages = await DataService.addStockOut({
    productId: data.productId,
    qty: data.qty,
    description: data.description,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Barang Keluar",
    details: `Produk ${data.productId}: -${data.qty} pcs. FIFO batches used: ${usages.length}`,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/pos");
  return usages;
}
