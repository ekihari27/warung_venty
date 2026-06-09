"use server";

import { DataService } from "@/lib/dataService";

export async function getAuditLogs() {
  return await DataService.getAuditLogs();
}
