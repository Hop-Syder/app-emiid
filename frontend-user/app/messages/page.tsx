import type { Metadata } from "next"
import { MessagesContent } from "@/components/messages-content"
import { Preloader } from "@/components/Preloader"
import { Suspense } from "react"

// Page privée → exclue de l'indexation.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function MessagesPage() {
  return (
    <div className="flex-1 w-full h-full max-h-full min-h-0 flex flex-col overflow-hidden">
      <Suspense fallback={<Preloader text="Chargement des messages" minHeight="min-h-[80vh]" />}>
        <MessagesContent />
      </Suspense>
    </div>
  )
}
