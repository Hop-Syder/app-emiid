/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout pour la messagerie avec hauteur responsive dynamique (prise en compte du dock mobile)
 * @created 2026-06-03
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { ProtectedShell } from "@/components/navigation/protected-shell"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

function InnerMessagesLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const contactId = searchParams.get("contact") || searchParams.get("user")
    const isMessageChatActive = !!contactId

    return (
        <div className={cn(
            "w-full bg-slate-50 overflow-hidden flex flex-col transition-all duration-300",
            isMessageChatActive ? "h-[100dvh] md:h-screen" : "h-[calc(100dvh-80px)] md:h-screen"
        )}>
            {children}
        </div>
    )
}

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>
            <Suspense fallback={<div className="h-screen w-full bg-slate-50" />}>
                <InnerMessagesLayout>{children}</InnerMessagesLayout>
            </Suspense>
        </ProtectedShell>
    )
}

