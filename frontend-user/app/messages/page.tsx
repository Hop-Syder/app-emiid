import { NukunLayout } from "@/components/menu/nukun-layout"
import { MessagesContent } from "@/components/messages-content"
import { Suspense } from "react"

export default function MessagesPage() {
  return (
    <NukunLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
        <MessagesContent />
      </Suspense>
    </NukunLayout>
  )
}
