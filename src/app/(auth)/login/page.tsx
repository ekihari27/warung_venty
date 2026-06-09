"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),transparent_18%)]" />
      <div className="absolute inset-0 bg-slate-950/90" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12">
        <div className="w-full rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-950 shadow-lg shadow-slate-950/20">
              <Leaf className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Warung Venty
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sistem kasir dan inventaris yang sederhana, profesional, dan mudah digunakan.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@venty.com"
                required
                className="h-11 rounded-2xl border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-2xl border border-slate-700 bg-slate-900 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-100"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-slate-950/20 transition-all duration-300 hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-4 text-sm text-slate-400">
            <p className="mb-3 text-center uppercase tracking-[0.22em] text-slate-500">
              Demo credentials
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-3 text-center">
                <p className="font-semibold text-slate-100">Admin</p>
                <p className="mt-1 text-slate-400">admin@venty.com</p>
                <p className="text-slate-400">admin123</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-3 text-center">
                <p className="font-semibold text-slate-100">Kasir</p>
                <p className="mt-1 text-slate-400">kasir@venty.com</p>
                <p className="text-slate-400">admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 mx-auto mt-6 max-w-md px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Warung Venty. All rights reserved.
      </p>
    </div>
  );
}
