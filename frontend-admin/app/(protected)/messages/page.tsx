/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de gestion des messages et litiges (Admin)
 * @created 2026-03-23
*/

import { Suspense } from 'react'
import AdminMessagesContent from '@/components/messages/admin-messages-content'

export const metadata = {
  title: 'Médiation & Messages | EmiID Admin',
  description: 'Gestion des litiges et médiations de la plateforme EmiID',
}

export default function AdminMessagesPage() {
  return (
    <div className="flex-1 h-screen overflow-hidden bg-slate-50">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AdminMessagesContent />
      </Suspense>
    </div>
  )
}
