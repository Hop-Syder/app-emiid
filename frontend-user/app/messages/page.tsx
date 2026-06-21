import { MessagesContent } from "@/components/messages-content"
import { Preloader } from "@/components/Preloader"
import { Suspense } from "react"

export default function MessagesPage() {
  return (
    <div className="flex-1 w-full h-full max-h-full min-h-0 flex flex-col overflow-hidden">
      <Suspense fallback={<Preloader text="Chargement des messages" minHeight="min-h-[80vh]" />}>
        <MessagesContent />
      </Suspense>
    </div>
  )
}
