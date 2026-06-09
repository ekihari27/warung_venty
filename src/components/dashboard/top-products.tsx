"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface Product {
  name: string;
  qty: number;
  revenue: number;
}

interface TopProductsProps {
  data: Product[];
}

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(160, 84%, 45%)",
  "hsl(160, 64%, 52%)",
  "hsl(156, 72%, 67%)",
  "hsl(152, 76%, 80%)",
  "hsl(149, 80%, 85%)",
  "hsl(152, 81%, 88%)",
  "hsl(199, 89%, 48%)",
  "hsl(43, 96%, 56%)",
  "hsl(280, 67%, 60%)",
];

export function TopProducts({ data }: TopProductsProps) {
  if (data.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <Trophy className="w-12 h-12 opacity-30" />
            <p className="text-sm">Belum ada data penjualan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
          <Trophy className="w-4.5 h-4.5 text-amber-500" />
          Top 10 Produk Terlaris
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[320px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900 dark:bg-slate-950/20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                  formatter={(value: unknown) => {
                    const count = typeof value === "number" ? value : Number(value ?? 0);
                    return [`${count} pcs`, "Terjual"] as [string, string];
                  }}
                />
                <Bar dataKey="qty" radius={[0, 4, 4, 0]} name="Terjual" barSize={12}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {data.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition hover:border-slate-200 dark:border-slate-900 dark:bg-slate-950/45 dark:hover:border-slate-800/80"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-450">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-white">{product.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{product.qty} terjual</p>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white shrink-0">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
