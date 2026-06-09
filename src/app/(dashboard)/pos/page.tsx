import { getSettings } from "@/actions/pos";
import { PosClient } from "./pos-client";

export default async function PosPage() {
  const settings = await getSettings();

  return (
    <PosClient
      defaultTax={settings.defaultTax || 0}
      qrisImage={settings.qrisImage || null}
      storeName={settings.storeName || "WARUNG VENTY"}
      storeAddress={settings.address || null}
      storePhone={settings.phone || null}
      receiptFooter={settings.receiptFooter || null}
    />
  );
}
