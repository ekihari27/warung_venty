import Link from "next/link";
import {
  getDashboardStats,
  getSalesChartData,
  getTopProducts,
  getLowStockProducts,
} from "@/actions/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopProducts } from "@/components/dashboard/top-products";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
} from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Pagi";
  if (hour < 16) return "Siang";
  return "Sore";
};

export default async function DashboardPage() {
  const [stats, chartData, topProducts, lowStock] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(),
    getTopProducts(),
    getLowStockProducts(),
  ]);

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 dark:border-emerald-900/20 dark:from-emerald-950/20 dark:to-transparent">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Ringkasan Toko Aktif
                </p>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Selamat {getGreeting()}, berikut kondisi toko Anda hari ini.
              </h1>
              <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Pantau metrik utama, aktivitas penjualan, dan stok kritis dalam satu tampilan yang bersih dan profesional.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/pos"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/10 transition hover:bg-emerald-500 active:scale-[0.98]"
              >
                Mulai Kasir
              </Link>
              <Link
                href="/reports"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Lihat Laporan
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <StatCard
            title="Total Produk"
            value={stats.totalProducts}
            icon={Package}
            color="emerald"
          />
          <StatCard
            title="Total Stok"
            value={stats.totalStock}
            icon={Boxes}
            color="amber"
            suffix=" unit"
          />
          <StatCard
            title="Transaksi Hari Ini"
            value={stats.salesToday}
            icon={ShoppingCart}
            color="emerald"
          />
          <StatCard
            title="Pendapatan Minggu Ini"
            value={formatCurrency(stats.revenueWeek)}
            icon={Calendar}
            color="blue"
            isString
          />
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatCurrency(stats.revenueMonth)}
            icon={TrendingUp}
            color="purple"
            isString
          />
          <StatCard
            title="Stok Menipis"
            value={stats.lowStockProducts}
            icon={AlertTriangle}
            color="amber"
            variant={stats.lowStockProducts > 0 ? "warning" : "default"}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1.2fr]">
          <SalesChart data={chartData} />
          <StockAlerts items={lowStock} />
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <TopProducts data={topProducts} />
      </ScrollReveal>
    </div>
  );
}
