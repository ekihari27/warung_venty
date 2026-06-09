import { getStoreSettings } from "@/actions/settings";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getStoreSettings();
  return <SettingsClient settings={JSON.parse(JSON.stringify(settings))} />;
}
