import { MessagesContent } from "@/components/messages-content"
import { Suspense } from "react"

export default function MessagesPage() {
  return (
    <div className="flex-1 w-full h-full max-h-full min-h-0 flex flex-col overflow-hidden">
      <Suspense fallback={<div className="flex h-full items-center justify-center bg-slate-50">Chargement...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  )
}
