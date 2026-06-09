import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, PackageX } from "lucide-react";

interface StockAlertsProps {
  items: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    unit: string;
  }[];
}

export function StockAlerts({ items }: StockAlertsProps) {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Peringatan Stok
          {items.length > 0 && (
            <Badge variant="warning" className="ml-auto">
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-500">
            <PackageX className="w-10 h-10" />
            <p className="text-sm">Semua stok aman</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[340px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
                <Badge
                  variant={item.stock === 0 ? "destructive" : "warning"}
                  className="shrink-0 ml-2"
                >
                  {item.stock === 0 ? "Habis" : `${item.stock} ${item.unit}`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
