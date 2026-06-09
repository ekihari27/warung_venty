"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  FileBarChart, Download, ShoppingCart, DollarSign, Package, Warehouse, Loader2,
  ArrowDownCircle, ArrowUpCircle, Boxes,
} from "lucide-react";

interface Props {
  salesReport: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
  };
  inventoryReport: {
    totalStockIn: number;
    totalStockOut: number;
    totalStockValue: number;
    totalStock: number;
    products: number;
    batches: number;
  };
}

export function ReportsClient({ salesReport, inventoryReport }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      const response = await fetch(`/api/export?type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `laporan-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Gagal mengexport laporan");
      }
    } catch {
      alert("Gagal mengexport laporan");
    }
    setExporting(false);
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Laporan" description="Lihat ringkasan laporan penjualan dan inventaris" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard title="Total Transaksi" value={salesReport.totalSales} icon={ShoppingCart} color="emerald" />
        <StatCard title="Total Pendapatan" value={formatCurrency(salesReport.totalRevenue)} icon={DollarSign} color="blue" isString />
        <StatCard title="Barang Masuk" value={inventoryReport.totalStockIn} icon={ArrowDownCircle} color="purple" suffix=" unit" />
        <StatCard title="Barang Keluar" value={inventoryReport.totalStockOut} icon={ArrowUpCircle} color="red" suffix=" unit" />
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="inventory">Inventaris</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Transaksi" value={salesReport.totalSales} icon={ShoppingCart} color="emerald" />
              <StatCard title="Total Pendapatan" value={formatCurrency(salesReport.totalRevenue)} icon={DollarSign} color="blue" isString />
              <StatCard title="Total Item Terjual" value={salesReport.totalItems} icon={Package} color="purple" suffix=" pcs" />
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Export Laporan Penjualan</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExport("sales")} disabled={exporting}>
                    {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 text-center">
                  <FileBarChart className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Klik &quot;Export Excel&quot; untuk mengunduh laporan penjualan lengkap dalam format XLSX
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Barang Masuk" value={inventoryReport.totalStockIn} icon={ArrowDownCircle} color="emerald" suffix=" unit" />
              <StatCard title="Barang Keluar" value={inventoryReport.totalStockOut} icon={ArrowUpCircle} color="red" suffix=" unit" />
              <StatCard title="Stok Saat Ini" value={inventoryReport.totalStock} icon={Boxes} color="blue" suffix=" unit" />
              <StatCard title="Nilai Persediaan" value={formatCurrency(inventoryReport.totalStockValue)} icon={DollarSign} color="purple" isString />
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Export Laporan Inventaris</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleExport("inventory")} disabled={exporting}>
                    {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50 text-center">
                  <Warehouse className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    Klik &quot;Export Excel&quot; untuk mengunduh laporan inventaris lengkap dalam format XLSX
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
