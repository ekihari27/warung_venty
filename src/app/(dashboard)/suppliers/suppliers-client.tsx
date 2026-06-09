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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/suppliers";
import { Plus, Pencil, Trash2, Search, Truck, Loader2, Mail, Phone } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

interface Supplier {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
}

export function SuppliersClient({ suppliers: initial }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const phoneCount = initial.filter((s) => !!s.phone).length;
  const emailCount = initial.filter((s) => !!s.email).length;

  const filtered = initial.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing) {
          await updateSupplier(editing.id, formData);
        } else {
          await createSupplier(formData);
        }
        setDialogOpen(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan supplier");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteSupplier(deleteTarget.id);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menghapus supplier");
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Manajemen Supplier" description="Kelola data supplier warung Anda">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Tambah Supplier
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard title="Total Supplier" value={initial.length} icon={Truck} color="blue" />
        <StatCard title="Supplier dengan Email" value={emailCount} icon={Mail} color="emerald" />
        <StatCard title="Supplier dengan Telepon" value={phoneCount} icon={Phone} color="purple" />
      </div>

      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Cari supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={Truck} title="Belum ada supplier" description="Tambahkan supplier untuk mengelola pasokan barang">
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Tambah Supplier</Button>
        </EmptyState>
      ) : (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Supplier</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sup) => (
                <TableRow key={sup.id}>
                  <TableCell className="font-medium">{sup.name}</TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">{sup.address || "-"}</TableCell>
                  <TableCell>{sup.phone || "-"}</TableCell>
                  <TableCell>{sup.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(sup); setDialogOpen(true); }} aria-label={`Edit supplier ${sup.name}`}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(sup)} aria-label={`Hapus supplier ${sup.name}`}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="name">Nama Supplier</Label><Input id="name" name="name" required defaultValue={editing?.name || ""} placeholder="PT Example" /></div>
              <div className="space-y-2"><Label htmlFor="address">Alamat</Label><Textarea id="address" name="address" defaultValue={editing?.address || ""} placeholder="Jl. Contoh No. 1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="phone">Telepon</Label><Input id="phone" name="phone" defaultValue={editing?.phone || ""} placeholder="08xx" /></div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={editing?.email || ""} placeholder="email@example.com" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? "Simpan" : "Tambah"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Hapus Supplier" description={`Hapus supplier "${deleteTarget?.name}"?`} confirmLabel="Hapus" loading={isPending} />
    </div>
  );
}
