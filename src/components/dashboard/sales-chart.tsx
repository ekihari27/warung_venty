"use client";

// Formatter types refined; avoid using `any`.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SalesChartProps {
  data: {
    date: string;
    penjualan: number;
    pendapatan: number;
  }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Grafik Penjualan</CardTitle>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Pendapatan</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">Transaksi</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pendapatan">
          <TabsList className="mb-4">
            <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
            <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="pendapatan">
            <div className="h-[320px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(162, 77%, 42%)" stopOpacity={0.36} />
                      <stop offset="95%" stopColor="hsl(162, 77%, 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border) / 0.8)" vertical={false} opacity={0.55} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(1)}jt`
                        : value >= 1000
                        ? `${(value / 1000).toFixed(0)}rb`
                        : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "16px",
                      fontSize: "12px",
                      boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
                    }}
                    itemStyle={{ color: "hsl(162, 77%, 42%)" }}
                    labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
                    formatter={(value: unknown) => {
                      const formatted = typeof value === "number" ? value.toLocaleString("id-ID") : String(value ?? "-");
                      return [`Rp ${formatted}`, "Pendapatan"] as [string, string];
                    }}
                    cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pendapatan"
                    stroke="hsl(162, 77%, 42%)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="transaksi">
            <div className="h-[320px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="hsl(162, 77%, 42%)" stopOpacity={0.9} />
                      <stop offset="90%" stopColor="hsl(162, 77%, 42%)" stopOpacity={0.18} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border) / 0.8)" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "16px",
                      fontSize: "12px",
                      boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
                    }}
                    itemStyle={{ color: "hsl(162, 77%, 42%)" }}
                    labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
                    cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  />
                  <Bar
                    dataKey="penjualan"
                    fill="url(#colorSales)"
                    radius={[10, 10, 0, 0]}
                    name="Transaksi"
                    isAnimationActive
                    animationDuration={1000}
                    animationEasing="ease"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
