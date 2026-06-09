"use server";

import { DataService, type DataServiceType } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return await DataService.getProducts();
}

export async function getProductById(id: string) {
  return await DataService.getProductById(id);
}

export async function createProduct(data: {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
  description?: string;
  imageBase64?: string;
}) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  let imageUrl: string | undefined;
  if (data.imageBase64) {
    imageUrl = await uploadToCloudinary(data.imageBase64, "warung-venty/products");
  }

  const product = await DataService.createProduct({
    name: data.name,
    sku: data.sku,
    barcode: data.barcode,
    categoryId: data.categoryId,
    purchasePrice: data.purchasePrice,
    sellingPrice: data.sellingPrice,
    unit: data.unit,
    description: data.description,
    image: imageUrl,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Tambah Produk",
    details: `Produk "${data.name}" (SKU: ${data.sku}) ditambahkan.`,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/pos");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    sku?: string;
    barcode?: string;
    categoryId?: string;
    purchasePrice?: number;
    sellingPrice?: number;
    unit?: string;
    description?: string;
    imageBase64?: string;
    active?: boolean;
  }
) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  let imageUrl: string | undefined;
  if (data.imageBase64) {
    imageUrl = await uploadToCloudinary(data.imageBase64, "warung-venty/products");
  }

  type UpdateProductPayload = Parameters<DataServiceType["updateProduct"]>[1];
  const updateData: UpdateProductPayload = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.barcode !== undefined) updateData.barcode = data.barcode;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
  if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.active !== undefined) updateData.active = data.active;
  if (imageUrl) updateData.image = imageUrl;

  const product = await DataService.updateProduct(id, updateData);

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Edit Produk",
    details: `Produk "${data.name || id}" diperbarui.`,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/pos");
  return product;
}
