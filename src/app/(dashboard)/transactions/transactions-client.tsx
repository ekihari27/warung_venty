"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { History, Eye, Printer, Search, Banknote, QrCode, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface SaleData {
  id: string;
  invoiceNumber: string;
  cashier?: { name: string } | null;
  totalPrice: number;
  tax: number;
  finalPrice: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items?: {
    id: string;
    product?: { name: string } | null;
    qty: number;
    sellingPrice: number;
    subtotal: number;
  }[];
}

export function TransactionsClient({
  sales,
  storeName,
  storeAddress,
  receiptFooter,
}: {
  sales: SaleData[];
  storeName: string;
  storeAddress: string | null;
  receiptFooter: string | null;
}) {
  const [search, setSearch] = useState("");
  const [detailSale, setDetailSale] = useState<SaleData | null>(null);
  const [dateFilter, setDateFilter] = useState("today");

  const totalCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);
  const pendingCount = sales.filter((s) => s.paymentStatus !== "PAID").length;
  const _today = new Date();
  const _todayStart = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate());
  const todayRevenue = sales.reduce((sum, s) => {
    const d = new Date(s.createdAt);
    return d >= _todayStart ? sum + (s.finalPrice || 0) : sum;
  }, 0);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const filtered = sales.filter((s) => {
    const d = new Date(s.createdAt);
    let dateMatch = true;
    if (dateFilter === "today") dateMatch = d >= todayStart;
    else if (dateFilter === "week") dateMatch = d >= weekStart;
    else if (dateFilter === "month") dateMatch = d >= monthStart;

    const searchMatch = !search ||
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.cashier?.name || "").toLowerCase().includes(search.toLowerCase());

    return dateMatch && searchMatch;
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Riwayat Transaksi" description="Lihat semua transaksi penjualan" />

      <div className="grid gap-4 lg:grid-cols-4 mb-6">
        <StatCard title="Total Transaksi" value={totalCount} icon={History} color="blue" />
        <StatCard title="Total Pendapatan" value={formatCurrency(totalRevenue)} icon={Banknote} color="emerald" isString />
        <StatCard title="Pending Pembayaran" value={pendingCount} icon={AlertTriangle} color="amber" />
        <StatCard title="Pendapatan Hari Ini" value={formatCurrency(todayRevenue || 0)} icon={QrCode} color="purple" isString />
      </div>

      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari invoice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {["today", "week", "month", "all"].map((f) => (
                <Button key={f} variant={dateFilter === f ? "default" : "outline"} size="sm" onClick={() => setDateFilter(f)}>
                  {f === "today" ? "Hari Ini" : f === "week" ? "Minggu Ini" : f === "month" ? "Bulan Ini" : "Semua"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="Belum ada transaksi" description="Transaksi akan muncul setelah penjualan dilakukan" />
      ) : (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead className="text-center">Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono text-sm">{sale.invoiceNumber}</TableCell>
                  <TableCell>{sale.cashier?.name || "-"}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(sale.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sale.paymentMethod === "CASH" ? "success" : "info"}>
                      {sale.paymentMethod === "CASH" ? <Banknote className="w-3 h-3 mr-1" /> : <QrCode className="w-3 h-3 mr-1" />}
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(sale.finalPrice)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sale.paymentStatus === "PAID" ? "success" : "warning"}>
                      {sale.paymentStatus === "PAID" ? "Lunas" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDetailSale(sale)} aria-label={`Lihat detail ${sale.invoiceNumber}`}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailSale} onOpenChange={() => setDetailSale(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Detail Transaksi</DialogTitle></DialogHeader>
          {detailSale && (
            <div className="receipt-print">
              <div className="border rounded-lg p-4 text-sm space-y-3 font-mono">
                <div className="text-center">
                  <p className="font-bold text-lg">{storeName}</p>
                  {storeAddress && <p className="text-xs text-slate-500">{storeAddress}</p>}
                </div>
                <Separator />
                <div className="text-xs space-y-1">
                  <p>No: {detailSale.invoiceNumber}</p>
                  <p>Kasir: {detailSale.cashier?.name}</p>
                  <p>Tanggal: {formatDateTime(detailSale.createdAt)}</p>
                </div>
                <Separator />
                <div className="text-xs space-y-1">
                  {detailSale.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate flex-1 mr-2">{item.product?.name} x{item.qty}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(detailSale.totalPrice)}</span></div>
                  {detailSale.tax > 0 && <div className="flex justify-between"><span>Pajak</span><span>{formatCurrency(detailSale.tax)}</span></div>}
                  <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{formatCurrency(detailSale.finalPrice)}</span></div>
                  <div className="flex justify-between"><span>{detailSale.paymentMethod}</span><span>{formatCurrency(detailSale.paidAmount)}</span></div>
                  {detailSale.changeAmount > 0 && <div className="flex justify-between"><span>Kembali</span><span>{formatCurrency(detailSale.changeAmount)}</span></div>}
                </div>
                <Separator />
                <p className="text-xs text-slate-500 text-center">{receiptFooter || "Terima Kasih!"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailSale(null)}>Tutup</Button>
            <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Cetak Ulang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
