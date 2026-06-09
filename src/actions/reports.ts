"use server";

import { DataService } from "@/lib/dataService";

export async function getSales(filters?: { startDate?: string; endDate?: string }) {
  const parsed: { startDate?: Date; endDate?: Date } = {};
  if (filters?.startDate) parsed.startDate = new Date(filters.startDate);
  if (filters?.endDate) parsed.endDate = new Date(filters.endDate);

  return await DataService.getSales(parsed.startDate || parsed.endDate ? parsed : undefined);
}

export async function getSalesReport(period: "daily" | "weekly" | "monthly" | "yearly") {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "weekly":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "monthly":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const sales = await DataService.getSales({ startDate });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.finalPrice, 0);
  const totalItems = sales.reduce(
    (sum, s) => sum + ((s as { items?: { qty: number }[] }).items?.reduce((is, i) => is + i.qty, 0) || 0), 0
  );

  return {
    totalSales,
    totalRevenue,
    totalItems,
    sales: sales.slice(0, 100),
  };
}

export async function getInventoryReport() {
  const batches = await DataService.getStockBatches();
  const movements = await DataService.getStockMovements();
  const products = await DataService.getProducts();

  const totalStockIn = movements.filter((m) => m.type === "IN").reduce((sum, m) => sum + m.qty, 0);
  const totalStockOut = movements.filter((m) => m.type === "OUT").reduce((sum, m) => sum + m.qty, 0);
  const totalStockValue = batches.reduce((sum, b) => sum + b.remainingQty * b.purchasePrice, 0);
  const totalStock = batches.reduce((sum, b) => sum + b.remainingQty, 0);

  return {
    totalStockIn,
    totalStockOut,
    totalStockValue,
    totalStock,
    products: products.length,
    batches: batches.length,
  };
}
