"use server";

import { DataService } from "@/lib/dataService";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const products = await DataService.getProducts();
  const categories = await DataService.getCategories();
  const suppliers = await DataService.getSuppliers();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allSales = await DataService.getSales();
  const salesToday = allSales.filter(
    (s) => new Date(s.createdAt) >= todayStart
  );
  const salesWeek = allSales.filter(
    (s) => new Date(s.createdAt) >= weekStart
  );
  const salesMonth = allSales.filter(
    (s) => new Date(s.createdAt) >= monthStart
  );

  // Calculate total stock from batches
  const batches = await DataService.getStockBatches();
  const totalStock = batches.reduce((sum, b) => sum + b.remainingQty, 0);

  // Low stock = products with total remaining < 10
  const productStockMap = new Map<string, number>();
  batches.forEach((b) => {
    const current = productStockMap.get(b.productId) || 0;
    productStockMap.set(b.productId, current + b.remainingQty);
  });

  let lowStockProducts = 0;
  let outOfStockProducts = 0;
  products.forEach((p) => {
    const stock = productStockMap.get(p.id) || 0;
    if (stock === 0) outOfStockProducts++;
    else if (stock < 10) lowStockProducts++;
  });

  const sumFinalPrice = (sales: typeof allSales) =>
    sales.reduce((sum, s) => sum + s.finalPrice, 0);

  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    totalSuppliers: suppliers.length,
    totalStock,
    lowStockProducts,
    outOfStockProducts,
    salesToday: salesToday.length,
    salesWeek: salesWeek.length,
    salesMonth: salesMonth.length,
    revenueToday: sumFinalPrice(salesToday),
    revenueWeek: sumFinalPrice(salesWeek),
    revenueMonth: sumFinalPrice(salesMonth),
    totalRevenue: sumFinalPrice(allSales),
  };
}

export async function getSalesChartData() {
  const allSales = await DataService.getSales();
  const now = new Date();

  // Last 7 days
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const daySales = allSales.filter(
      (s) => new Date(s.createdAt) >= dayStart && new Date(s.createdAt) < dayEnd
    );

    dailyData.push({
      date: dayStart.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      penjualan: daySales.length,
      pendapatan: daySales.reduce((sum, s) => sum + s.finalPrice, 0),
    });
  }

  return dailyData;
}

export async function getTopProducts() {
  const allSales = await DataService.getSales();
  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();

  allSales.forEach((sale) => {
    if (sale.items) {
      sale.items.forEach((item: { productId: string; qty: number; subtotal: number; product?: { name: string } | null }) => {
        const current = productSales.get(item.productId) || {
          name: item.product?.name || "Unknown",
          qty: 0,
          revenue: 0,
        };
        current.qty += item.qty;
        current.revenue += item.subtotal;
        productSales.set(item.productId, current);
      });
    }
  });

  return Array.from(productSales.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
}

export async function getLowStockProducts() {
  const products = await DataService.getProducts();
  const batches = await DataService.getStockBatches();

  const productStockMap = new Map<string, number>();
  batches.forEach((b) => {
    const current = productStockMap.get(b.productId) || 0;
    productStockMap.set(b.productId, current + b.remainingQty);
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: productStockMap.get(p.id) || 0,
      unit: p.unit,
    }))
    .filter((p) => p.stock < 10)
    .sort((a, b) => a.stock - b.stock);
}
