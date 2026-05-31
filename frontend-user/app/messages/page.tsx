import { MessagesContent } from "@/components/messages-content"
import { Suspense } from "react"

export default function MessagesPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  )
}
