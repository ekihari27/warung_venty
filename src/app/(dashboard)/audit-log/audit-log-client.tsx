"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import { ClipboardList, Search, User, Activity } from "lucide-react";

interface AuditLogEntry {
  id: string;
  userId: string | null;
  user?: { name: string } | null;
  userName: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const actionColorMap: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  Login: "success",
  Logout: "secondary",
  "Tambah Produk": "info",
  "Edit Produk": "warning",
  "Hapus Produk": "destructive",
  "Tambah Kategori": "info",
  "Edit Kategori": "warning",
  "Hapus Kategori": "destructive",
  "Tambah Supplier": "info",
  "Edit Supplier": "warning",
  "Hapus Supplier": "destructive",
  "Barang Masuk": "success",
  "Barang Keluar": "warning",
  Penjualan: "success",
  "Export Laporan": "info",
  "Perubahan Pengaturan": "warning",
  "Tambah User": "info",
  "Edit User": "warning",
  "Reset Password User": "warning",
};

export function AuditLogClient({ logs }: { logs: AuditLogEntry[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
      ),
    [logs, search]
  );

  const uniqueUsers = useMemo(
    () => new Set(logs.map((log) => log.userName)).size,
    [logs]
  );

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Audit Log" description="Riwayat seluruh aktivitas pengguna dalam sistem" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        <StatCard title="Total Aktivitas" value={logs.length} icon={Activity} color="emerald" />
        <StatCard title="Pengguna Aktif" value={uniqueUsers} icon={User} color="blue" />
        <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/80">
          <CardContent className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pencarian Cepat</p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Cari aktivitas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11" />
            </div>
          </CardContent>
        </Card>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum ada log aktivitas" description="Aktivitas akan tercatat setelah pengguna melakukan aksi" />
      ) : (
        <Card className="border-none shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                        {log.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{log.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionColorMap[log.action] || "default"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[300px] truncate">
                    {log.details || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 font-mono">
                    {log.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
