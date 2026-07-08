import { getAuditLog } from "@/lib/actions/admin"
import { AuditLogClient } from "@/components/audit-log-client"

export const metadata = {
  title: "Journal d'audit | EmiID Admin",
}

export default async function AuditPage() {
  const entries = await getAuditLog({ limit: 200 })
  return <AuditLogClient initialEntries={entries} />
}
