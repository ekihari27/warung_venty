import { getSalesReport, getInventoryReport } from "@/actions/reports";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const [salesReport, inventoryReport] = await Promise.all([
    getSalesReport("monthly"),
    getInventoryReport(),
  ]);

  return (
    <ReportsClient
      salesReport={salesReport}
      inventoryReport={inventoryReport}
    />
  );
}
