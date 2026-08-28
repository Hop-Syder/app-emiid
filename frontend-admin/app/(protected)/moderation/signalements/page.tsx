import { getContentReports } from "@/lib/actions/admin"
import { ContentReportsClient } from "@/components/content-reports-client"

export const metadata = {
  title: "Signalements | EmiID Admin",
}

export default async function ReportsPage() {
  const reports = await getContentReports({ status: "open", limit: 200 })
  return <ContentReportsClient initialReports={reports} />
}
