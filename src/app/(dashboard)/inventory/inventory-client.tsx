"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { addStockIn, addStockOut } from "@/actions/inventory";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  PackagePlus, PackageMinus, Warehouse, Loader2, ArrowDownCircle, ArrowUpCircle,
} from "lucide-react";

interface Props {
  products: { id: string; name: string; sku: string; unit: string; stockBatches?: { remainingQty: number }[] }[];
  suppliers: { id: string; name: string }[];
  batches: {
    id: string; productId: string; product?: { name: string } | null;
    supplier?: { name: string } | null;
    initialQty: number; remainingQty: number; purchasePrice: number;
    receivedAt: string | Date;
  }[];
  movements: {
    id: string; productId: string; product?: { name: string } | null;
    qty: number; type: "IN" | "OUT"; source: string;
    description: string | null; createdAt: string | Date;
  }[];
}

export function InventoryClient({ products, suppliers, batches, movements }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);

  const getStock = (productId: string) => {
    return batches.filter((b) => b.productId === productId).reduce((sum, b) => sum + b.remainingQty, 0);
  };

  const totalProducts = products.length;
  const totalStock = batches.reduce((sum, batch) => sum + batch.remainingQty, 0);
  const totalBatches = batches.length;
  const lowStockCount = products.filter((p) => {
    const stock = getStock(p.id);
    return stock > 0 && stock < 10;
  }).length;
  

  const handleStockIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addStockIn({
          productId: fd.get("productId") as string,
          supplierId: (fd.get("supplierId") as string) || undefined,
          qty: parseFloat(fd.get("qty") as string),
          purchasePrice: parseFloat(fd.get("purchasePrice") as string),
          description: (fd.get("description") as string) || undefined,
        });
        setStockInOpen(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menambah stok");
      }
    });
  };

  const handleStockOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addStockOut({
          productId: fd.get("productId") as string,
          qty: parseFloat(fd.get("qty") as string),
          description: (fd.get("description") as string) || undefined,
        });
        setStockOutOpen(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal mengeluarkan stok");
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Inventaris" description="Kelola stok barang dengan sistem FIFO">
        <Button variant="outline" onClick={() => setStockOutOpen(true)}>
          <PackageMinus className="w-4 h-4 mr-2" />Barang Keluar
        </Button>
        <Button onClick={() => setStockInOpen(true)}>
          <PackagePlus className="w-4 h-4 mr-2" />Barang Masuk
        </Button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-4 mb-6">
        <StatCard title="Total Produk" value={totalProducts} icon={PackagePlus} color="emerald" />
        <StatCard title="Total Stok" value={`${totalStock}`} icon={Warehouse} color="blue" suffix=" unit" />
        <StatCard title="Batch Tersedia" value={totalBatches} icon={ArrowDownCircle} color="purple" />
        <StatCard title="Stok Menipis" value={lowStockCount} icon={ArrowUpCircle} color="amber" suffix=" produk" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Ringkasan Stok</TabsTrigger>
          <TabsTrigger value="batches">Batch FIFO</TabsTrigger>
          <TabsTrigger value="movements">Riwayat Pergerakan</TabsTrigger>
        </TabsList>

        {/* Stock Overview */}
        <TabsContent value="overview">
          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stok Total</TableHead>
                  <TableHead className="text-center">Jumlah Batch</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const stock = getStock(p.id);
                  const batchCount = batches.filter((b) => b.productId === p.id && b.remainingQty > 0).length;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                      <TableCell className="text-center font-semibold">{stock} {p.unit}</TableCell>
                      <TableCell className="text-center">{batchCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={stock === 0 ? "destructive" : stock < 10 ? "warning" : "success"}>
                          {stock === 0 ? "Habis" : stock < 10 ? "Menipis" : "Aman"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Batch FIFO */}
        <TabsContent value="batches">
          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Qty Awal</TableHead>
                  <TableHead className="text-right">Qty Tersisa</TableHead>
                  <TableHead className="text-right">Harga Modal</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.product?.name || "-"}</TableCell>
                    <TableCell className="text-slate-500">{b.supplier?.name || "-"}</TableCell>
                    <TableCell className="text-right">{b.initialQty}</TableCell>
                    <TableCell className="text-right font-semibold">{b.remainingQty}</TableCell>
                    <TableCell className="text-right">{formatCurrency(b.purchasePrice)}</TableCell>
                    <TableCell>{formatDateTime(b.receivedAt)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={b.remainingQty === 0 ? "secondary" : b.remainingQty < b.initialQty ? "warning" : "success"}>
                        {b.remainingQty === 0 ? "Habis" : b.remainingQty < b.initialQty ? "Sebagian" : "Penuh"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Movements */}
        <TabsContent value="movements">
          <Card className="border-none shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Tipe</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.slice(0, 50).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm">{formatDateTime(m.createdAt)}</TableCell>
                    <TableCell className="font-medium">{m.product?.name || "-"}</TableCell>
                    <TableCell className="text-center">
                      {m.type === "IN" ? (
                        <Badge variant="success"><ArrowDownCircle className="w-3 h-3 mr-1" />Masuk</Badge>
                      ) : (
                        <Badge variant="destructive"><ArrowUpCircle className="w-3 h-3 mr-1" />Keluar</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{m.qty}</TableCell>
                    <TableCell><Badge variant="secondary">{m.source}</Badge></TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{m.description || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock In Dialog */}
      <Dialog open={stockInOpen} onOpenChange={setStockInOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Barang Masuk</DialogTitle></DialogHeader>
          <form onSubmit={handleStockIn}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produk *</Label>
                <Select name="productId" required><option value="">Pilih Produk</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select name="supplierId"><option value="">Pilih Supplier</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Qty *</Label><Input name="qty" type="number" min="1" required placeholder="0" /></div>
                <div className="space-y-2"><Label>Harga Modal *</Label><Input name="purchasePrice" type="number" min="0" required placeholder="0" /></div>
              </div>
              <div className="space-y-2"><Label>Keterangan</Label><Textarea name="description" placeholder="Keterangan barang masuk" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockInOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={stockOutOpen} onOpenChange={setStockOutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Barang Keluar</DialogTitle></DialogHeader>
          <form onSubmit={handleStockOut}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produk *</Label>
                <Select name="productId" required><option value="">Pilih Produk</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stok: {getStock(p.id)})</option>)}</Select>
              </div>
              <div className="space-y-2"><Label>Qty *</Label><Input name="qty" type="number" min="1" required placeholder="0" /></div>
              <div className="space-y-2"><Label>Keterangan</Label><Textarea name="description" placeholder="Alasan barang keluar (rusak, expired, dll)" /></div>
              <div className="p-3 rounded-3xl border border-amber-200/80 bg-amber-50 text-sm text-amber-900">
                ⚠️ Stok akan dikurangi otomatis menggunakan metode FIFO (First In, First Out)
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockOutOpen(false)}>Batal</Button>
              <Button type="submit" variant="destructive" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Keluarkan Stok</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
