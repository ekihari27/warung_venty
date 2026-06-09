"use client";

// Link removed — not used in header
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/types";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  Bell,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  FileBarChart,
  Package,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

const pathLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "Point of Sale",
  "/transactions": "Riwayat Transaksi",
  "/products": "Manajemen Produk",
  "/categories": "Manajemen Kategori",
  "/suppliers": "Manajemen Supplier",
  "/inventory": "Inventaris",
  "/reports": "Laporan",
  "/users": "Manajemen Pengguna",
  "/settings": "Pengaturan Toko",
  "/audit-log": "Audit Log",
};

const quickActions = [
  { label: "Kasir Cepat", href: "/pos", icon: ShoppingCart },
  { label: "Laporan", href: "/reports", icon: FileBarChart },
  { label: "Produk", href: "/products", icon: Package },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function Header({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileOpen } = useSidebarStore();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [showPalette, setShowPalette] = useState(false);
  const [greeting, setGreeting] = useState("Selamat Datang");

  const pageTitle = pathLabels[pathname] || "Warung Venty";

  useEffect(() => {
    const stored = localStorage.getItem("warung-venty-theme");
    if (stored === "dark") {
      setDarkMode(true);
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Selamat Pagi");
    else if (hour < 16) setGreeting("Selamat Siang");
    else setGreeting("Selamat Sore");
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowPalette((value) => !value);
      }
      if (event.key === "Escape") {
        setShowPalette(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("warung-venty-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("warung-venty-theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/70 backdrop-blur-md transition-colors duration-300 text-slate-900 dark:border-slate-900/50 dark:bg-slate-950/70 dark:text-slate-100">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden rounded-xl border border-slate-200/80 bg-white/90 p-1.5 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:bg-slate-900/80"
          aria-label="Buka sidebar"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <div className="hidden md:flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{greeting}</p>
          <h2 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-white">{pageTitle}</h2>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari menu, transaksi, produk..."
            className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-0 pl-10 pr-12 text-sm text-slate-900 transition duration-300 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/80 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-950">
            <span>Ctrl</span><span>K</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPalette(true)}
            className="hidden xl:inline-flex h-9 w-9 rounded-xl"
            aria-label="Command palette"
          >
            <Sparkles className="w-4 h-4" />
          </Button>

          <button
            onClick={toggleDarkMode}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/50 text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/50 text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Notifikasi"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 p-1 pr-3 text-sm transition hover:bg-slate-50 dark:border-slate-800/65 dark:bg-slate-900/50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">{user.name}</p>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-2 animate-fade-in-up dark:border-slate-900/50 dark:bg-slate-950/95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400">{user.email}</p>
                  </div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-700 transition-colors hover:bg-slate-50 hover:text-rose-600 dark:text-slate-350 dark:hover:bg-slate-900/50 dark:hover:text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showPalette && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-2xl dark:border-slate-800/70 dark:bg-slate-950/95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Command palette</p>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Buka halaman atau jalankan aksi cepat</h3>
              </div>
              <button
                onClick={() => setShowPalette(false)}
                className="rounded-full border border-slate-200 bg-white/80 p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/70 dark:bg-slate-950/80 dark:text-slate-200"
                aria-label="Tutup command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="h-14 w-full rounded-3xl border border-slate-200 bg-slate-50/95 py-0 pl-12 pr-4 text-sm text-slate-950 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100"
                placeholder="Cari perintah atau halaman..."
                autoFocus
              />
            </div>
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => {
                    setShowPalette(false);
                    router.push(action.href);
                  }}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left text-sm text-slate-900 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-100 dark:hover:bg-slate-900/80"
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-emerald-600" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
