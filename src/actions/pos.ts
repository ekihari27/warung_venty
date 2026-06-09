"use server";

import { DataService } from "@/lib/dataService";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function searchPosProducts(query: string) {
  const products = await DataService.getProducts();
  const batches = await DataService.getStockBatches();

  const stockMap = new Map<string, number>();
  batches.forEach((b) => {
    stockMap.set(b.productId, (stockMap.get(b.productId) || 0) + b.remainingQty);
  });

  const q = query.toLowerCase();
  return products
    .filter(
      (p) =>
        p.active &&
        (p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q)))
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: (p as { barcode?: string | null }).barcode || null,
      sellingPrice: p.sellingPrice,
      unit: p.unit,
      image: p.image || null,
      stock: stockMap.get(p.id) || 0,
    }))
    .slice(0, 20);
}

export async function getProductByBarcode(barcode: string) {
  const products = await DataService.getProducts();
  const batches = await DataService.getStockBatches();

  const stockMap = new Map<string, number>();
  batches.forEach((b) => {
    stockMap.set(b.productId, (stockMap.get(b.productId) || 0) + b.remainingQty);
  });

  const product = products.find(
    (p) => p.active && (p as { barcode?: string | null }).barcode === barcode
  );

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: (product as { barcode?: string | null }).barcode || null,
    sellingPrice: product.sellingPrice,
    unit: product.unit,
    image: product.image || null,
    stock: stockMap.get(product.id) || 0,
  };
}

export async function createTransaction(data: {
  items: { productId: string; qty: number; sellingPrice: number }[];
  paymentMethod: "CASH" | "QRIS";
  paymentStatus: "PENDING" | "PAID";
  paidAmount: number;
  tax: number;
}) {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const totalPrice = data.items.reduce(
    (sum, item) => sum + item.qty * item.sellingPrice,
    0
  );
  const taxAmount = totalPrice * (data.tax / 100);
  const finalPrice = totalPrice + taxAmount;
  const changeAmount = Math.max(0, data.paidAmount - finalPrice);

  // Generate invoice number
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const invoiceNumber = `INV-${dateStr}-${random}`;

  const sale = await DataService.createSale({
    invoiceNumber,
    cashierId: user.id,
    totalPrice,
    tax: taxAmount,
    finalPrice,
    paidAmount: data.paidAmount,
    changeAmount,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentStatus,
    items: data.items,
  });

  await DataService.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: "Penjualan",
    details: `Transaksi ${invoiceNumber}: ${formatRp(finalPrice)} (${data.paymentMethod}) - ${data.items.length} item`,
  });

  revalidatePath("/pos");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/inventory");
  revalidatePath("/products");

  return {
    ...sale,
    invoiceNumber,
    cashierName: user.name,
    totalPrice,
    tax: taxAmount,
    finalPrice,
    paidAmount: data.paidAmount,
    changeAmount,
    items: data.items,
  };
}

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export async function getSettings() {
  return await DataService.getSettings();
}
