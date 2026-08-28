import { getAdminSettings } from "@/lib/actions/admin"
import { AdminSettingsClient } from "@/components/admin-settings-client"

export default async function SettingsPage() {
  const settings = await getAdminSettings()

  return <AdminSettingsClient initialSettings={settings} />
}
