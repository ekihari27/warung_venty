"use server";

import { DataService, type DataServiceType } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getStoreSettings() {
  return await DataService.getSettings();
}

export async function updateStoreSettings(data: {
  storeName?: string;
  address?: string;
  phone?: string;
  receiptFooter?: string;
  defaultTax?: number;
  logoBase64?: string;
  qrisBase64?: string;
}) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  type UpdateSettingsPayload = Parameters<DataServiceType["updateSettings"]>[0];
  const updateData: UpdateSettingsPayload = {};

  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.receiptFooter !== undefined) updateData.receiptFooter = data.receiptFooter;
  if (data.defaultTax !== undefined) updateData.defaultTax = data.defaultTax;

  if (data.logoBase64) {
    updateData.logo = await uploadToCloudinary(data.logoBase64, "warung-venty/settings");
  }
  if (data.qrisBase64) {
    updateData.qrisImage = await uploadToCloudinary(data.qrisBase64, "warung-venty/settings");
  }

  const result = await DataService.updateSettings(updateData);

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Perubahan Pengaturan",
    details: `Pengaturan toko diperbarui.`,
  });

  revalidatePath("/settings");
  revalidatePath("/pos");
  return result;
}
