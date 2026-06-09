"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Search, Package, Loader2, ImageIcon, CheckCircle, AlertTriangle, Tags } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  category?: { id: string; name: string } | null;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
  description: string | null;
  image: string | null;
  active: boolean;
  stockBatches?: { remainingQty: number }[];
}

interface Category {
  id: string;
  name: string;
}

export function ProductsClient({
  products: initial,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getStock = (product: Product) => {
    return product.stockBatches?.reduce((sum, b) => sum + b.remainingQty, 0) || 0;
  };

  const activeCount = initial.filter((product) => product.active).length;
  const lowStockCount = initial.filter((product) => {
    const stock = getStock(product);
    return stock > 0 && stock < 10;
  }).length;

  const filtered = initial.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCategory = !categoryFilter || p.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      barcode: (formData.get("barcode") as string) || undefined,
      categoryId: formData.get("categoryId") as string,
      purchasePrice: parseFloat(formData.get("purchasePrice") as string) || 0,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string) || 0,
      unit: formData.get("unit") as string,
      description: (formData.get("description") as string) || undefined,
      imageBase64: imagePreview || undefined,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updateProduct(editing.id, data);
        } else {
          await createProduct(data);
        }
        setDialogOpen(false);
        setEditing(null);
        setImagePreview(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan produk");
      }
    });
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setImagePreview(product.image);
    setDialogOpen(true);
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Manajemen Produk" description="Kelola produk dan informasi harga">
        <Button onClick={() => { setEditing(null); setImagePreview(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Tambah Produk
        </Button>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-4 mb-6">
        <StatCard title="Total Produk" value={initial.length} icon={Package} color="blue" />
        <StatCard title="Produk Aktif" value={activeCount} icon={CheckCircle} color="emerald" />
        <StatCard title="Stok Rendah" value={lowStockCount} icon={AlertTriangle} color="amber" />
        <StatCard title="Kategori Terdaftar" value={categories.length} icon={Tags} color="purple" />
      </div>

      {/* Filters */}
      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari nama, SKU, barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-48">
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Belum ada produk" description="Tambahkan produk pertama Anda">
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Tambah Produk</Button>
        </EmptyState>
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Modal</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => {
                  const stock = getStock(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell><Badge variant="secondary">{product.category?.name || "-"}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(product.purchasePrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(product.sellingPrice)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={stock === 0 ? "destructive" : stock < 10 ? "warning" : "success"}>
                          {stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.active ? "success" : "secondary"}>
                          {product.active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setImagePreview(null); } }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Produk" : "Tambah Produk"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">Nama Produk *</Label><Input id="name" name="name" required defaultValue={editing?.name || ""} placeholder="Kopi Susu" /></div>
                <div className="space-y-2"><Label htmlFor="sku">SKU *</Label><Input id="sku" name="sku" required defaultValue={editing?.sku || ""} placeholder="KOP-SUS-01" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="barcode">Barcode</Label><Input id="barcode" name="barcode" defaultValue={editing?.barcode || ""} placeholder="899123456001" /></div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kategori *</Label>
                  <Select id="categoryId" name="categoryId" required defaultValue={editing?.categoryId || ""}>
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="purchasePrice">Harga Modal *</Label><Input id="purchasePrice" name="purchasePrice" type="number" required defaultValue={editing?.purchasePrice || ""} placeholder="0" /></div>
                <div className="space-y-2"><Label htmlFor="sellingPrice">Harga Jual *</Label><Input id="sellingPrice" name="sellingPrice" type="number" required defaultValue={editing?.sellingPrice || ""} placeholder="0" /></div>
                <div className="space-y-2"><Label htmlFor="unit">Satuan *</Label><Input id="unit" name="unit" required defaultValue={editing?.unit || "pcs"} placeholder="pcs" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Deskripsi</Label><Textarea id="description" name="description" defaultValue={editing?.description || ""} placeholder="Deskripsi produk" /></div>
              <div className="space-y-2">
                <Label htmlFor="image">Foto Produk</Label>
                <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? "Simpan" : "Tambah"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
