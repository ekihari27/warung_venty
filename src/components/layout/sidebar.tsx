"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";
import type { SessionUser } from "@/types";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Warehouse,
  ShoppingCart,
  FileBarChart,
  Settings,
  Users,
  ClipboardList,
  Leaf,
  ChevronLeft,
  X,
  History,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navGroups: {
  label: string;
  items: NavItem[];
}[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: true },
      { label: "POS / Kasir", href: "/pos", icon: ShoppingCart },
      { label: "Riwayat Transaksi", href: "/transactions", icon: History },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Produk", href: "/products", icon: Package },
      { label: "Kategori", href: "/categories", icon: Tags },
      { label: "Supplier", href: "/suppliers", icon: Truck, adminOnly: true },
      { label: "Inventaris", href: "/inventory", icon: Warehouse },
      { label: "Laporan", href: "/reports", icon: FileBarChart },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Pengguna", href: "/users", icon: Users, adminOnly: true },
      { label: "Pengaturan", href: "/settings", icon: Settings, adminOnly: true },
      { label: "Audit Log", href: "/audit-log", icon: ClipboardList, adminOnly: true },
    ],
  },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.adminOnly || user.role === "ADMIN"
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full border-r transition-all duration-300 flex flex-col",
          "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-900/50 text-slate-800 dark:text-slate-100 shadow-[2px_0_8px_rgba(0,0,0,0.01)]",
          collapsed ? "w-[72px]" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-slate-200/50 dark:border-slate-900/50 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">Warung Venty</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Enterprise POS</p>
              </div>
            </Link>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Leaf className="w-4.5 h-4.5" />
            </div>
          )}

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Tutup"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-900/40",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-900/70 text-slate-450 dark:text-slate-500"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200/50 dark:border-slate-900/50 px-3 py-3">
          <button
            onClick={toggle}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/80 py-2 text-xs text-slate-600 dark:text-slate-350 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span>Tutup Sidebar</span>}
          </button>
        </div>

        {!collapsed && (
          <div className="border-t border-slate-200/50 dark:border-slate-900/50 px-4 py-4">
            <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-450">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
