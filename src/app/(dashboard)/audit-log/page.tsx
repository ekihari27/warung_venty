import { getAuditLogs } from "@/actions/audit";
import { AuditLogClient } from "./audit-log-client";

export default async function AuditLogPage() {
  const logs = await getAuditLogs();
  return <AuditLogClient logs={JSON.parse(JSON.stringify(logs))} />;
}
