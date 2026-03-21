import { NexusLayout } from "@/components/menu/nexus-layout"
import { MessagesContent } from "@/components/messages-content"
import { Suspense } from "react"

export default function MessagesPage() {
  return (
    <NexusLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
        <MessagesContent />
      </Suspense>
    </NexusLayout>
  )
}
