export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "KASIR";
}

export interface User extends SessionUser {
  passwordHash: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  category?: Category | null;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
  description: string | null;
  image: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
  stockBatches?: StockBatch[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt?: Date;
  products?: Product[];
}

export interface Supplier {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface StockBatch {
  id: string;
  productId: string;
  product?: Product | null;
  supplierId: string | null;
  supplier?: Supplier | null;
  initialQty: number;
  remainingQty: number;
  purchasePrice: number;
  receivedAt: Date;
  expiredAt?: Date | null;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product | null;
  batchId?: string | null;
  qty: number;
  type: "IN" | "OUT";
  source: "SALE" | "MANUAL" | "ADJUSTMENT";
  description: string | null;
  referenceId?: string | null;
  createdAt: Date;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  cashierId: string;
  cashier?: SessionUser | null;
  totalPrice: number;
  tax: number;
  finalPrice: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: "CASH" | "QRIS";
  paymentStatus: "PENDING" | "PAID";
  createdAt: Date;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product | null;
  qty: number;
  sellingPrice: number;
  subtotal: number;
  purchasePrice: number;
  batchUsages?: BatchUsage[];
}

export interface BatchUsage {
  id: string;
  saleItemId: string;
  batchId: string;
  batch?: StockBatch | null;
  qty: number;
  purchasePrice: number;
}

export interface Setting {
  id: string;
  storeName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  qrisImage: string | null;
  receiptFooter: string | null;
  defaultTax: number;
  updatedAt?: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user?: SessionUser | null;
  userName: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  image: string | null;
  sellingPrice: number;
  qty: number;
  unit: string;
  maxStock: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  totalRevenue: number;
}
