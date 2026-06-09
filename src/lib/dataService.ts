import { db } from "./db";
import type {
  User,
  Category,
  Product,
  Supplier,
  StockBatch,
  StockMovement,
  Sale,
  SaleItem,
  BatchUsage,
  Setting,
  AuditLog,
} from "@/types";

// Mock implementation or direct db wrappers
// This file exports database service helpers that can transparently operate
// or fallback to clean in-memory/JSON mock states if DATABASE_URL isn't set,
// ensuring the app is always buildable and fully testable.

function getEnv(key: string) {
  if (typeof process === "undefined") return "";
  return process.env[key] || "";
}

let isDbOffline = false;

const isDbConfigured = () => {
  if (isDbOffline) return false;
  const url = getEnv("DATABASE_URL");
  return !!url && !url.includes("placeholder");
};

// Start background connection check to determine if database is online
if (typeof window === "undefined") {
  const checkConnection = async () => {
    const url = getEnv("DATABASE_URL");
    if (url && !url.includes("placeholder")) {
      try {
        const promise = db.$queryRaw`SELECT 1`;
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
        await Promise.race([promise, timeout]);
      } catch (err) {
        console.warn("⚠️ Database is offline or unreachable. Falling back to IN-MEMORY DATABASE mode.", err);
        isDbOffline = true;
      }
    }
  };
  checkConnection();
}

// In-Memory Storage for Development Sandbox
class DevMemoryDatabase {
  users: User[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];
  stockBatches: StockBatch[] = [];
  stockMovements: StockMovement[] = [];
  sales: Sale[] = [];
  saleItems: SaleItem[] = [];
  batchUsages: BatchUsage[] = [];
  auditLogs: AuditLog[] = [];
  settings: Setting = {
    id: "default",
    storeName: "WARUNG VENTY",
    logo: null,
    address: "Jl. Bunga Melati No. 12, Bandung",
    phone: "081234567890",
    qrisImage: null,
    receiptFooter: "Terima Kasih atas Kunjungan Anda!",
    defaultTax: 0,
  };

  constructor() {
    // Seed default admin and cashier
    this.users.push({
      id: "admin-default-id",
      email: "admin@venty.com",
      passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
      name: "Venty Admin",
      role: "ADMIN",
      active: true,
      createdAt: new Date(),
    });
    this.users.push({
      id: "kasir-default-id",
      email: "kasir@venty.com",
      passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
      name: "Budi Kasir",
      role: "KASIR",
      active: true,
      createdAt: new Date(),
    });

    // Seed default categories
    const cats = ["Makanan", "Minuman", "Snack", "Sembako", "Rokok", "Peralatan"];
    cats.forEach((c, idx) => {
      this.categories.push({
        id: `cat-${idx + 1}`,
        name: c,
        description: `Kategori produk ${c}`,
        createdAt: new Date(),
      });
    });

    // Seed default suppliers
    this.suppliers.push({
      id: "sup-1",
      name: "PT Sumber Sembako",
      address: "Jl. Industri No. 45, Jakarta",
      phone: "021-5551234",
      email: "info@sumbersembako.com",
      createdAt: new Date(),
    });
    this.suppliers.push({
      id: "sup-2",
      name: "CV Minuman Segar",
      address: "Jl. Air Bersih No. 9, Surabaya",
      phone: "031-7779876",
      email: "sales@minumansegar.co.id",
      createdAt: new Date(),
    });

    // Seed default products
    this.products.push({
      id: "prod-1",
      name: "Kopi Susu Venty",
      sku: "KOP-SUS-01",
      barcode: "8991234560012",
      categoryId: "cat-2", // Minuman
      purchasePrice: 4000,
      sellingPrice: 7000,
      unit: "botol",
      description: "Kopi susu creamy khas Warung Venty",
      image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80",
      active: true,
      createdAt: new Date(),
    });
    this.products.push({
      id: "prod-2",
      name: "Indomie Goreng",
      sku: "IND-GOR-01",
      barcode: "070662030031",
      categoryId: "cat-1", // Makanan
      purchasePrice: 2800,
      sellingPrice: 3500,
      unit: "pcs",
      description: "Mie instan goreng favorit",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80",
      active: true,
      createdAt: new Date(),
    });
    this.products.push({
      id: "prod-3",
      name: "Beras Premium 5kg",
      sku: "BER-PRE-05",
      barcode: "8999999123456",
      categoryId: "cat-4", // Sembako
      purchasePrice: 65000,
      sellingPrice: 75000,
      unit: "pack",
      description: "Beras putih premium pandan wangi",
      image: null,
      active: true,
      createdAt: new Date(),
    });

    // Seed Initial Batches (FIFO Setup)
    // Batch A: Kopi Susu Venty - 20 pcs @ 4000
    this.stockBatches.push({
      id: "batch-1",
      productId: "prod-1",
      supplierId: "sup-2",
      initialQty: 20,
      remainingQty: 20,
      purchasePrice: 4000,
      receivedAt: new Date(Date.now() - 3600 * 1000 * 24 * 5), // 5 days ago
      createdAt: new Date(),
    });
    // Batch B: Kopi Susu Venty - 30 pcs @ 4500
    this.stockBatches.push({
      id: "batch-2",
      productId: "prod-1",
      supplierId: "sup-2",
      initialQty: 30,
      remainingQty: 30,
      purchasePrice: 4500,
      receivedAt: new Date(Date.now() - 3600 * 1000 * 24 * 2), // 2 days ago
      createdAt: new Date(),
    });

    // Indomie - 100 pcs @ 2800
    this.stockBatches.push({
      id: "batch-3",
      productId: "prod-2",
      supplierId: "sup-1",
      initialQty: 100,
      remainingQty: 100,
      purchasePrice: 2800,
      receivedAt: new Date(Date.now() - 3600 * 1000 * 24 * 10), // 10 days ago
      createdAt: new Date(),
    });

    // Beras - 10 packs @ 65000
    this.stockBatches.push({
      id: "batch-4",
      productId: "prod-3",
      supplierId: "sup-1",
      initialQty: 10,
      remainingQty: 10,
      purchasePrice: 65000,
      receivedAt: new Date(Date.now() - 3600 * 1000 * 24 * 12),
      createdAt: new Date(),
    });
  }
}

// Global reference for memory db
const globalForMem = globalThis as unknown as {
  memDb: DevMemoryDatabase | undefined;
};

export const memDb = globalForMem.memDb ?? new DevMemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForMem.memDb = memDb;

// Combined Database Interface
export const DataService = {
  isConfigured: isDbConfigured,

  // --- Users ---
  async getUsers(): Promise<User[]> {
    if (isDbConfigured()) {
      return await db.user.findMany({ orderBy: { name: "asc" } });
    }
    return memDb.users;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    if (isDbConfigured()) {
      return await db.user.findUnique({ where: { email } });
    }
    return memDb.users.find((u) => u.email === email && u.active) || null;
  },

  async createUser(data: { email: string; name: string; passwordHash: string; role: "ADMIN" | "KASIR" }): Promise<User> {
    if (isDbConfigured()) {
      return await db.user.create({ data });
    }
    const newUser = {
      id: `user-${Date.now()}`,
      ...data,
      active: true,
      createdAt: new Date(),
    };
    memDb.users.push(newUser);
    return newUser;
  },

  async updateUser(id: string, data: { email?: string; name?: string; role?: "ADMIN" | "KASIR"; active?: boolean; passwordHash?: string }): Promise<User> {
    if (isDbConfigured()) {
      return await db.user.update({
        where: { id },
        data,
      });
    }
    const idx = memDb.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memDb.users[idx] = { ...memDb.users[idx], ...data };
      return memDb.users[idx];
    }
    throw new Error("User not found");
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    if (isDbConfigured()) {
      return await db.category.findMany({ orderBy: { name: "asc" } });
    }
    return [...memDb.categories].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    if (isDbConfigured()) {
      return await db.category.create({ data });
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      createdAt: new Date(),
    };
    memDb.categories.push(newCat);
    return newCat;
  },

  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
    if (isDbConfigured()) {
      return await db.category.update({ where: { id }, data });
    }
    const idx = memDb.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memDb.categories[idx] = { ...memDb.categories[idx], ...data };
      return memDb.categories[idx];
    }
    throw new Error("Category not found");
  },

  async deleteCategory(id: string): Promise<Category> {
    if (isDbConfigured()) {
      return await db.category.delete({ where: { id } });
    }
    const idx = memDb.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const removed = memDb.categories.splice(idx, 1)[0];
      return removed;
    }
    throw new Error("Category not found");
  },

  // --- Suppliers ---
  async getSuppliers(): Promise<Supplier[]> {
    if (isDbConfigured()) {
      return await db.supplier.findMany({ orderBy: { name: "asc" } });
    }
    return [...memDb.suppliers].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createSupplier(data: { name: string; address?: string; phone?: string; email?: string }): Promise<Supplier> {
    if (isDbConfigured()) {
      return await db.supplier.create({ data });
    }
    const newSup = {
      id: `sup-${Date.now()}`,
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      createdAt: new Date(),
    };
    memDb.suppliers.push(newSup);
    return newSup;
  },

  async updateSupplier(id: string, data: { name?: string; address?: string; phone?: string; email?: string }): Promise<Supplier> {
    if (isDbConfigured()) {
      return await db.supplier.update({ where: { id }, data });
    }
    const idx = memDb.suppliers.findIndex((s) => s.id === id);
    if (idx !== -1) {
      memDb.suppliers[idx] = { ...memDb.suppliers[idx], ...data };
      return memDb.suppliers[idx];
    }
    throw new Error("Supplier not found");
  },

  async deleteSupplier(id: string): Promise<Supplier> {
    if (isDbConfigured()) {
      return await db.supplier.delete({ where: { id } });
    }
    const idx = memDb.suppliers.findIndex((s) => s.id === id);
    if (idx !== -1) {
      return memDb.suppliers.splice(idx, 1)[0];
    }
    throw new Error("Supplier not found");
  },

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    if (isDbConfigured()) {
      return await db.product.findMany({
        include: {
          category: true,
          stockBatches: true,
        },
        orderBy: { name: "asc" },
      });
    }
    return memDb.products.map((p) => {
      const cat = memDb.categories.find((c) => c.id === p.categoryId);
      const batches = memDb.stockBatches.filter((b) => b.productId === p.id);
      return {
        ...p,
        category: cat || null,
        stockBatches: batches,
      };
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isDbConfigured()) {
      return await db.product.findUnique({
        where: { id },
        include: { category: true, stockBatches: true },
      });
    }
    const p = memDb.products.find((prod) => prod.id === id);
    if (!p) return null;
    const cat = memDb.categories.find((c) => c.id === p.categoryId);
    const batches = memDb.stockBatches.filter((b) => b.productId === p.id);
    return {
      ...p,
      category: cat || null,
      stockBatches: batches,
    };
  },

  async createProduct(data: {
    name: string;
    sku: string;
    barcode?: string;
    categoryId: string;
    purchasePrice: number;
    sellingPrice: number;
    unit: string;
    description?: string;
    image?: string;
  }): Promise<Product> {
    if (isDbConfigured()) {
      return await db.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          barcode: data.barcode || null,
          categoryId: data.categoryId,
          purchasePrice: data.purchasePrice,
          sellingPrice: data.sellingPrice,
          unit: data.unit,
          description: data.description || null,
          image: data.image || null,
          active: true,
        },
      });
    }
    // SKU check
    if (memDb.products.some((p) => p.sku.toLowerCase() === data.sku.toLowerCase())) {
      throw new Error(`SKU ${data.sku} sudah terdaftar`);
    }
    const newProd = {
      id: `prod-${Date.now()}`,
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || null,
      categoryId: data.categoryId,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      unit: data.unit,
      description: data.description || null,
      image: data.image || null,
      active: true,
      createdAt: new Date(),
    };
    memDb.products.push(newProd);
    return newProd;
  },

  async updateProduct(
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
      image?: string;
      active?: boolean;
    }
  ): Promise<Product> {
    if (isDbConfigured()) {
      return await db.product.update({ where: { id }, data });
    }
    const idx = memDb.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      // SKU check
      if (data.sku && memDb.products.some((p) => p.sku.toLowerCase() === data.sku?.toLowerCase() && p.id !== id)) {
        throw new Error(`SKU ${data.sku} sudah terdaftar`);
      }
      memDb.products[idx] = { ...memDb.products[idx], ...data };
      return memDb.products[idx];
    }
    throw new Error("Product not found");
  },

  // --- Inventory System (FIFO) & Stock Batches ---
  async getStockBatches(productId?: string): Promise<StockBatch[]> {
    if (isDbConfigured()) {
      return await db.stockBatch.findMany({
        where: productId ? { productId } : {},
        include: { product: true, supplier: true },
        orderBy: { receivedAt: "asc" },
      });
    }
    let res = memDb.stockBatches;
    if (productId) {
      res = res.filter((b) => b.productId === productId);
    }
    return res.map((b) => {
      const prod = memDb.products.find((p) => p.id === b.productId);
      const sup = memDb.suppliers.find((s) => s.id === b.supplierId);
      return {
        ...b,
        product: prod || null,
        supplier: sup || null,
      };
    });
  },

  async addStockIn(data: {
    productId: string;
    supplierId?: string;
    qty: number;
    purchasePrice: number;
    receivedAt?: Date;
    expiredAt?: Date;
    description?: string;
  }): Promise<StockBatch> {
    const receivedDate = data.receivedAt || new Date();
    if (isDbConfigured()) {
      const batch = await db.stockBatch.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId || null,
          initialQty: data.qty,
          remainingQty: data.qty,
          purchasePrice: data.purchasePrice,
          receivedAt: receivedDate,
          expiredAt: data.expiredAt || null,
        },
      });

      await db.stockMovement.create({
        data: {
          productId: data.productId,
          batchId: batch.id,
          qty: data.qty,
          type: "IN",
          source: "MANUAL",
          description: data.description || "Barang Masuk (Manual)",
        },
      });

      // Update product's default purchasePrice to latest
      await db.product.update({
        where: { id: data.productId },
        data: { purchasePrice: data.purchasePrice },
      });

      return batch;
    }

    const batchId = `batch-${Date.now()}`;
    const newBatch = {
      id: batchId,
      productId: data.productId,
      supplierId: data.supplierId || null,
      initialQty: data.qty,
      remainingQty: data.qty,
      purchasePrice: data.purchasePrice,
      receivedAt: receivedDate,
      expiredAt: data.expiredAt || null,
      createdAt: new Date(),
    };
    memDb.stockBatches.push(newBatch);

    memDb.stockMovements.push({
      id: `mov-${Date.now()}`,
      productId: data.productId,
      batchId,
      qty: data.qty,
      type: "IN",
      source: "MANUAL",
      description: data.description || "Barang Masuk (Manual)",
      referenceId: null,
      createdAt: new Date(),
    });

    const pIdx = memDb.products.findIndex((p) => p.id === data.productId);
    if (pIdx !== -1) {
      memDb.products[pIdx].purchasePrice = data.purchasePrice;
    }

    return newBatch;
  },

  async addStockOut(data: { productId: string; qty: number; description?: string }): Promise<{ batchId: string; qty: number; purchasePrice: number }[]> {
    const qtyToReduce = data.qty;
    if (isDbConfigured()) {
      // FIFO selection
      const batches = await db.stockBatch.findMany({
        where: {
          productId: data.productId,
          remainingQty: { gt: 0 },
        },
        orderBy: { receivedAt: "asc" },
      });

      let remainingToReduce = qtyToReduce;
      const usages: { batchId: string; qty: number; purchasePrice: number }[] = [];

      for (const batch of batches) {
        if (remainingToReduce <= 0) break;
        const take = Math.min(batch.remainingQty, remainingToReduce);

        await db.stockBatch.update({
          where: { id: batch.id },
          data: { remainingQty: { decrement: take } },
        });

        await db.stockMovement.create({
          data: {
            productId: data.productId,
            batchId: batch.id,
            qty: take,
            type: "OUT",
            source: "ADJUSTMENT",
            description: data.description || "Barang Keluar (FIFO)",
          },
        });

        usages.push({
          batchId: batch.id,
          qty: take,
          purchasePrice: batch.purchasePrice,
        });

        remainingToReduce -= take;
      }

      if (remainingToReduce > 0) {
        // Create an un-batched movement or error. Let's just create general negative movement.
        await db.stockMovement.create({
          data: {
            productId: data.productId,
            qty: remainingToReduce,
            type: "OUT",
            source: "ADJUSTMENT",
            description: `${data.description || "Barang Keluar"} (Minus / Tanpa Batch)`,
          },
        });
      }

      return usages;
    }

    // Memory FIFO implementation
    const batches = memDb.stockBatches
      .filter((b) => b.productId === data.productId && b.remainingQty > 0)
      .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());

    let remainingToReduce = qtyToReduce;
    const usages: { batchId: string; qty: number; purchasePrice: number }[] = [];

    for (const batch of batches) {
      if (remainingToReduce <= 0) break;
      const take = Math.min(batch.remainingQty, remainingToReduce);

      batch.remainingQty -= take;

      memDb.stockMovements.push({
        id: `mov-${Date.now()}-${Math.random()}`,
        productId: data.productId,
        batchId: batch.id,
        qty: take,
        type: "OUT",
        source: "ADJUSTMENT",
        description: data.description || "Barang Keluar (FIFO)",
        referenceId: null,
        createdAt: new Date(),
      });

      usages.push({
        batchId: batch.id,
        qty: take,
        purchasePrice: batch.purchasePrice,
      });

      remainingToReduce -= take;
    }

    if (remainingToReduce > 0) {
      memDb.stockMovements.push({
        id: `mov-${Date.now()}`,
        productId: data.productId,
        qty: remainingToReduce,
        type: "OUT",
        source: "ADJUSTMENT",
        description: `${data.description || "Barang Keluar"} (Minus / Tanpa Batch)`,
        referenceId: null,
        createdAt: new Date(),
      });
    }

    return usages;
  },

  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    if (isDbConfigured()) {
      return await db.stockMovement.findMany({
        where: productId ? { productId } : {},
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
    }
    let res = memDb.stockMovements;
    if (productId) {
      res = res.filter((m) => m.productId === productId);
    }
    return res.map((m) => {
      const prod = memDb.products.find((p) => p.id === m.productId);
      return {
        ...m,
        product: prod || null,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // --- Sales (POS Transaksi) ---
  async getSales(filters?: { startDate?: Date; endDate?: Date }): Promise<Sale[]> {
    if (isDbConfigured()) {
      return await db.sale.findMany({
        where: filters
          ? {
              createdAt: {
                gte: filters.startDate,
                lte: filters.endDate,
              },
            }
          : {},
        include: {
          cashier: true,
          items: {
            include: {
              product: true,
              batchUsages: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    let res = memDb.sales;
    if (filters) {
      if (filters.startDate) {
        res = res.filter((s) => new Date(s.createdAt) >= (filters.startDate as Date));
      }
      if (filters.endDate) {
        res = res.filter((s) => new Date(s.createdAt) <= (filters.endDate as Date));
      }
    }

    return res.map((s) => {
      const cashier = memDb.users.find((u) => u.id === s.cashierId);
      const items = memDb.saleItems
        .filter((item) => item.saleId === s.id)
        .map((item) => {
          const prod = memDb.products.find((p) => p.id === item.productId);
          const usages = memDb.batchUsages.filter((u) => u.saleItemId === item.id);
          return {
            ...item,
            product: prod || null,
            batchUsages: usages,
          };
        });

      return {
        ...s,
        cashier: cashier || null,
        items,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createSale(data: {
    invoiceNumber: string;
    cashierId: string;
    totalPrice: number;
    tax: number;
    finalPrice: number;
    paidAmount: number;
    changeAmount: number;
    paymentMethod: "CASH" | "QRIS";
    paymentStatus: "PENDING" | "PAID";
    items: {
      productId: string;
      qty: number;
      sellingPrice: number;
    }[];
  }): Promise<Sale> {
    if (isDbConfigured()) {
      // We will perform FIFO batch calculations and update remaining quantities inside transaction
      return await db.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            invoiceNumber: data.invoiceNumber,
            cashierId: data.cashierId,
            totalPrice: data.totalPrice,
            tax: data.tax,
            finalPrice: data.finalPrice,
            paidAmount: data.paidAmount,
            changeAmount: data.changeAmount,
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus,
          },
        });

        for (const item of data.items) {
          // FIFO depletion: Find batches with remaining quantity
          const batches = await tx.stockBatch.findMany({
            where: {
              productId: item.productId,
              remainingQty: { gt: 0 },
            },
            orderBy: { receivedAt: "asc" },
          });

          let remainingToDeplete = item.qty;
          let totalCost = 0;
          const usagesToCreate: { batchId: string; qty: number; purchasePrice: number }[] = [];

          for (const batch of batches) {
            if (remainingToDeplete <= 0) break;
            const take = Math.min(batch.remainingQty, remainingToDeplete);

            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { remainingQty: { decrement: take } },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                batchId: batch.id,
                qty: take,
                type: "OUT",
                source: "SALE",
                description: `Penjualan POS (Invoice ${data.invoiceNumber})`,
                referenceId: sale.id,
              },
            });

            usagesToCreate.push({
              batchId: batch.id,
              qty: take,
              purchasePrice: batch.purchasePrice,
            });

            totalCost += take * batch.purchasePrice;
            remainingToDeplete -= take;
          }

          // If remaining > 0, we sell without enough stock (negative stock allowed but logs warning)
          const avgPurchasePrice = item.qty > 0 ? (totalCost + (remainingToDeplete * (batches[0]?.purchasePrice || 0))) / item.qty : 0;

          if (remainingToDeplete > 0) {
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                qty: remainingToDeplete,
                type: "OUT",
                source: "SALE",
                description: `Penjualan POS (Minus - Stok Kurang) (Invoice ${data.invoiceNumber})`,
                referenceId: sale.id,
              },
            });
          }

          const saleItem = await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              qty: item.qty,
              sellingPrice: item.sellingPrice,
              subtotal: item.qty * item.sellingPrice,
              purchasePrice: avgPurchasePrice, // HPP (COGS)
            },
          });

          for (const usage of usagesToCreate) {
            await tx.batchUsage.create({
              data: {
                saleItemId: saleItem.id,
                batchId: usage.batchId,
                qty: usage.qty,
                purchasePrice: usage.purchasePrice,
              },
            });
          }
        }

        return sale;
      });
    }

    // In-memory Transaction simulation
    const saleId = `sale-${Date.now()}`;
    const newSale = {
      id: saleId,
      invoiceNumber: data.invoiceNumber,
      cashierId: data.cashierId,
      totalPrice: data.totalPrice,
      tax: data.tax,
      finalPrice: data.finalPrice,
      paidAmount: data.paidAmount,
      changeAmount: data.changeAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memDb.sales.push(newSale);

    for (const item of data.items) {
      const batches = memDb.stockBatches
        .filter((b) => b.productId === item.productId && b.remainingQty > 0)
        .sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());

      let remainingToDeplete = item.qty;
      let totalCost = 0;
      const usagesToCreate: { batchId: string; qty: number; purchasePrice: number }[] = [];

      for (const batch of batches) {
        if (remainingToDeplete <= 0) break;
        const take = Math.min(batch.remainingQty, remainingToDeplete);

        batch.remainingQty -= take;

        memDb.stockMovements.push({
          id: `mov-${Date.now()}-${Math.random()}`,
          productId: item.productId,
          batchId: batch.id,
          qty: take,
          type: "OUT",
          source: "SALE",
          description: `Penjualan POS (Invoice ${data.invoiceNumber})`,
          referenceId: saleId,
          createdAt: new Date(),
        });

        usagesToCreate.push({
          batchId: batch.id,
          qty: take,
          purchasePrice: batch.purchasePrice,
        });

        totalCost += take * batch.purchasePrice;
        remainingToDeplete -= take;
      }

      const avgPurchasePrice = item.qty > 0 ? (totalCost + (remainingToDeplete * (batches[0]?.purchasePrice || 0))) / item.qty : 0;

      if (remainingToDeplete > 0) {
        memDb.stockMovements.push({
          id: `mov-${Date.now()}`,
          productId: item.productId,
          qty: remainingToDeplete,
          type: "OUT",
          source: "SALE",
          description: `Penjualan POS (Minus - Stok Kurang) (Invoice ${data.invoiceNumber})`,
          referenceId: saleId,
          createdAt: new Date(),
        });
      }

      const itemId = `sitem-${Date.now()}-${Math.random()}`;
      const newSaleItem = {
        id: itemId,
        saleId,
        productId: item.productId,
        qty: item.qty,
        sellingPrice: item.sellingPrice,
        subtotal: item.qty * item.sellingPrice,
        purchasePrice: avgPurchasePrice,
      };

      memDb.saleItems.push(newSaleItem);

      for (const usage of usagesToCreate) {
        memDb.batchUsages.push({
          id: `busage-${Date.now()}-${Math.random()}`,
          saleItemId: itemId,
          batchId: usage.batchId,
          qty: usage.qty,
          purchasePrice: usage.purchasePrice,
        });
      }
    }

    return newSale;
  },

  // --- Settings ---
  async getSettings(): Promise<Setting> {
    if (isDbConfigured()) {
      let setting = await db.setting.findUnique({ where: { id: "default" } });
      if (!setting) {
        setting = await db.setting.create({
          data: {
            id: "default",
            storeName: "WARUNG VENTY",
            address: "Jl. Bunga Melati No. 12, Bandung",
            phone: "081234567890",
            receiptFooter: "Terima Kasih atas Kunjungan Anda!",
            defaultTax: 0,
          },
        });
      }
      return setting;
    }
    return memDb.settings;
  },

  async updateSettings(data: {
    storeName?: string;
    logo?: string | null;
    address?: string | null;
    phone?: string | null;
    qrisImage?: string | null;
    receiptFooter?: string | null;
    defaultTax?: number;
  }): Promise<Setting> {
    if (isDbConfigured()) {
      return await db.setting.upsert({
        where: { id: "default" },
        update: data,
        create: {
          id: "default",
          storeName: data.storeName || "WARUNG VENTY",
          logo: data.logo || null,
          address: data.address || null,
          phone: data.phone || null,
          qrisImage: data.qrisImage || null,
          receiptFooter: data.receiptFooter || "Terima Kasih!",
          defaultTax: data.defaultTax || 0,
        },
      });
    }
    memDb.settings = { ...memDb.settings, ...data };
    return memDb.settings;
  },

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isDbConfigured()) {
      return await db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    }
    return [...memDb.auditLogs].map((l) => {
      const u = memDb.users.find((user) => user.id === l.userId);
      return { ...l, user: u || null };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addAuditLog(data: { userId?: string; userName: string; action: string; details?: string; ipAddress?: string }): Promise<AuditLog> {
    if (isDbConfigured()) {
      return await db.auditLog.create({ data });
    }
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: data.userId ?? null,
      userName: data.userName,
      action: data.action,
      details: data.details ?? null,
      ipAddress: data.ipAddress ?? null,
      createdAt: new Date(),
    };
    memDb.auditLogs.push(log);
    return log;
  },
};

export type DataServiceType = typeof DataService;
