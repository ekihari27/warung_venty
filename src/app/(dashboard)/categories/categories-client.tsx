"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";
import { Plus, Pencil, Trash2, Search, Tags, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
}

export function CategoriesClient({ categories: initialCategories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesWithDescription = initialCategories.filter((c) => !!c.description).length;
  const latestCategory = [...initialCategories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const filtered = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, formData);
        } else {
          await createCategory(formData);
        }
        setDialogOpen(false);
        setEditingCategory(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan kategori");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteCategory(deleteTarget.id);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menghapus kategori");
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Manajemen Kategori"
        description="Kelola kategori produk warung Anda"
      >
        <Button onClick={() => { setEditingCategory(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard title="Total Kategori" value={initialCategories.length} icon={Tags} color="blue" />
        <StatCard title="Kategori dengan Deskripsi" value={categoriesWithDescription} icon={Pencil} color="emerald" />
        <StatCard title="Kategori Terbaru" value={latestCategory?.name || "Belum ada"} icon={Tags} color="purple" isString />
      </div>

      {/* Search */}
      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan produk Anda"
        >
          <Button onClick={() => { setEditingCategory(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </EmptyState>
      ) : (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-slate-500">
                    {cat.description || "-"}
                  </TableCell>
                  <TableCell>{formatDate(cat.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingCategory(cat); setDialogOpen(true); }}
                        aria-label={`Edit kategori ${cat.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(cat)}
                        aria-label={`Hapus kategori ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingCategory(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ""}
                  placeholder="Contoh: Minuman"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCategory?.description || ""}
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCategory ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Semua produk dalam kategori ini juga akan terhapus.`}
        confirmLabel="Hapus"
        loading={isPending}
      />
    </div>
  );
}
