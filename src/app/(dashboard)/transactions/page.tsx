import { getSales } from "@/actions/reports";
import { DataService } from "@/lib/dataService";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage() {
  const [sales, settings] = await Promise.all([
    getSales(),
    DataService.getSettings(),
  ]);

  return (
    <TransactionsClient
      sales={JSON.parse(JSON.stringify(sales))}
      storeName={settings.storeName}
      storeAddress={settings.address}
      receiptFooter={settings.receiptFooter}
    />
  );
}
