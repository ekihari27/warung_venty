"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { createUser, updateUser } from "@/actions/users";
import { Plus, Pencil, Shield, ShieldOff, KeyRound, Loader2, Users, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export function UsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "KASIR">("ALL");

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [users, search, roleFilter]
  );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const cashierCount = users.filter((u) => u.role === "KASIR").length;
  const inactiveCount = users.filter((u) => !u.active).length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing) {
          await updateUser(editing.id, {
            email: fd.get("email") as string,
            name: fd.get("name") as string,
            role: fd.get("role") as "ADMIN" | "KASIR",
          });
        } else {
          await createUser({
            email: fd.get("email") as string,
            name: fd.get("name") as string,
            password: fd.get("password") as string,
            role: fd.get("role") as "ADMIN" | "KASIR",
          });
        }
        setDialogOpen(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan user");
      }
    });
  };

  const toggleActive = (user: User) => {
    startTransition(async () => {
      try {
        await updateUser(user.id, { active: !user.active });
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal mengubah status");
      }
    });
  };

  const handleResetPassword = () => {
    if (!resetPasswordId || !newPassword) return;
    startTransition(async () => {
      try {
        await updateUser(resetPasswordId, { newPassword });
        setResetPasswordId(null);
        setNewPassword("");
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal reset password");
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Manajemen Pengguna" description="Kelola akun admin dan kasir">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />Tambah User
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard title="Total Pengguna" value={users.length} icon={Users} color="emerald" />
        <StatCard title="Admin" value={adminCount} icon={Shield} color="blue" />
        <StatCard title="Kasir" value={cashierCount} icon={Users} color="purple" />
        <StatCard title="Nonaktif" value={inactiveCount} icon={ShieldOff} color="red" />
      </div>

      <Card className="border-none shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau role..."
              className="pl-11"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "ALL" | "ADMIN" | "KASIR")}
            className="max-w-[180px]"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="KASIR">Kasir</option>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell className="text-center" colSpan={6}>
                  <div className="py-12 text-slate-500">Tidak ada pengguna yang cocok dengan filter.</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-slate-500">{u.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : null}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={u.active ? "success" : "destructive"}>
                      {u.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setDialogOpen(true); }} aria-label={`Edit ${u.name}`} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setResetPasswordId(u.id)} aria-label={`Reset password ${u.name}`} title="Reset Password">
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(u)} aria-label={u.active ? `Nonaktifkan ${u.name}` : `Aktifkan ${u.name}`} title={u.active ? "Nonaktifkan" : "Aktifkan"}>
                        {u.active ? <ShieldOff className="w-4 h-4 text-destructive" /> : <Shield className="w-4 h-4 text-emerald-600" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit User" : "Tambah User"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nama</Label><Input name="name" required defaultValue={editing?.name || ""} /></div>
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required defaultValue={editing?.email || ""} /></div>
              {!editing && (
                <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" required placeholder="Min. 6 karakter" /></div>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" required defaultValue={editing?.role || "KASIR"}>
                  <option value="KASIR">Kasir</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editing ? "Simpan" : "Tambah"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordId} onOpenChange={() => { setResetPasswordId(null); setNewPassword(""); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Password Baru</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Masukkan password baru" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordId(null)}>Batal</Button>
            <Button onClick={handleResetPassword} disabled={isPending || !newPassword}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
