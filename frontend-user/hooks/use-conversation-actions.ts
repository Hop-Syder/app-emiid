"use client"

import { useCallback } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import { fetchConversations } from "@/features/messages/messagesApi"
import type { Conversation, Message } from "@/components/messages/types"

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024

interface UseConversationActionsOptions {
    currentUserId: string | null
    supabase: SupabaseClient
    selectedConv: Conversation | null
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
    setSelectedConv: React.Dispatch<React.SetStateAction<Conversation | null>>
}

export function useConversationActions({
    currentUserId,
    supabase,
    selectedConv,
    setMessages,
    setConversations,
    setSelectedConv,
}: UseConversationActionsOptions) {
    const getOrCreateConversationId = useCallback(async (receiverId: string): Promise<string> => {
        if (!currentUserId) throw new Error("Non authentifié")
        let convId = selectedConv?.id

        if (!convId || convId.startsWith("new-")) {
            const p1 = currentUserId < receiverId ? currentUserId : receiverId
            const p2 = currentUserId < receiverId ? receiverId : currentUserId

            const { data: existingConv } = await supabase
                .from("conversations")
                .select("id")
                .or(`and(participant1_id.eq.${p1},participant2_id.eq.${p2}),and(participant1_id.eq.${p2},participant2_id.eq.${p1})`)
                .maybeSingle()

            if (!existingConv) {
                const { data: newConv, error: createError } = await supabase
                    .from("conversations")
                    .insert({ participant1_id: p1, participant2_id: p2 })
                    .select("id")
                    .single()
                if (createError) throw createError
                convId = newConv.id
            } else {
                convId = existingConv.id
            }
        }
        if (!convId) throw new Error("Impossible de trouver ou créer la conversation")
        return convId
    }, [currentUserId, supabase, selectedConv])

    const sendToDB = useCallback(async (content: string, convId: string): Promise<Message> => {
        if (!currentUserId) throw new Error("Non authentifié")

        const { data: newMsg, error: msgError } = await supabase
            .from("messages")
            .insert({ conversation_id: convId, sender_id: currentUserId, content, is_read: false })
            .select()
            .single()

        if (msgError) throw msgError
        if (!newMsg) throw new Error("Erreur DB lors de la création du message")

        await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId)

        return {
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            sender_id: newMsg.sender_id,
            content: newMsg.content,
            is_read: newMsg.is_read,
            created_at: newMsg.created_at,
            is_mediation: false,
        }
    }, [currentUserId, supabase])

    const handleFileUpload = useCallback(async (file: File, convId: string): Promise<Message | undefined> => {
        if (!selectedConv || !currentUserId) return

        if (file.size > MAX_CONTENT_LENGTH) {
            toast.error("Fichier trop volumineux (Max 10MB)")
            return
        }
        const type = file.type.startsWith("image/") ? "image" : "file"
        const localMax = type === "image" ? 5 * 1024 * 1024 : MAX_CONTENT_LENGTH
        if (file.size > localMax) {
            toast.error(`Fichier trop volumineux (Max ${type === "image" ? "5MB" : "10MB"})`)
            return
        }

        const uploadToastId = toast.loading("Envoi du fichier...")
        try {
            const extension = file.name.split(".").pop()
            const filePath = `messages/${convId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
            const { error: uploadError } = await supabase.storage.from("messages").upload(filePath, file)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from("messages").getPublicUrl(filePath)
            const content = type === "image" ? `[Image] ${publicUrl}` : `[Fichier] ${file.name} - ${publicUrl}`
            const newMsg = await sendToDB(content, convId)
            toast.success("Fichier envoyé", { id: uploadToastId })
            return newMsg
        } catch (err) {
            console.error(err)
            toast.error("Échec de l'upload", { id: uploadToastId })
            throw err
        }
    }, [selectedConv, currentUserId, supabase, sendToDB])

    const handleSendMessage = useCallback(async (content: string, _type?: "text" | "emoji", file?: File) => {
        if (!selectedConv || (!content.trim() && !file) || !currentUserId) return

        const isNewConv = selectedConv.id.startsWith("new-")
        const optimisticId = `optimistic-${Date.now()}`
        const tempMsg: Message = {
            id: optimisticId,
            conversation_id: selectedConv.id,
            sender_id: currentUserId,
            content: file ? `[Fichier] ${file.name}` : content,
            is_read: false,
            is_mediation: false,
            created_at: new Date().toISOString(),
            status: "pending",
        }

        setMessages((prev) => [...prev, tempMsg])

        try {
            const convId = await getOrCreateConversationId(selectedConv.other_participant.user_id)
            let newMsg: Message | undefined

            if (file) {
                newMsg = await handleFileUpload(file, convId)
            } else {
                newMsg = await sendToDB(content, convId)
            }

            if (newMsg) {
                const finalMsg = newMsg
                setMessages((prev) => prev.map((m) => (m.id === optimisticId ? { ...finalMsg, status: "sent" as const } : m)))
                setConversations((prev) =>
                    prev.map((c) => {
                        if (c.id === selectedConv.id || c.id === convId) {
                            return {
                                ...c,
                                id: convId,
                                last_message: file ? `[Fichier] ${file.name}` : content,
                                last_message_at: finalMsg.created_at,
                                updated_at: finalMsg.created_at,
                            }
                        }
                        return c
                    })
                )
            }

            if (isNewConv && newMsg) {
                const updatedConvs = await fetchConversations()
                setConversations(updatedConvs)
                const newRealConv = updatedConvs.find((c) => c.id === convId)
                if (newRealConv) {
                    setSelectedConv(newRealConv)
                } else {
                    setSelectedConv((prev) => (prev ? { ...prev, id: convId } : null))
                }
            }
        } catch (err: unknown) {
            console.error(err)
            setMessages((prev) => prev.map((m) => (m.id === optimisticId ? { ...m, status: "error" as const } : m)))
            const msg = (err as { message?: string })?.message || "Erreur réseau"
            toast.error(`Échec de l'envoi : ${msg}`)
        }
    }, [selectedConv, currentUserId, getOrCreateConversationId, handleFileUpload, sendToDB, setMessages, setConversations, setSelectedConv])

    const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
        if (!messageId || !newContent.trim()) return
        try {
            const { error } = await supabase.from("messages").update({ content: newContent }).eq("id", messageId)
            if (error) throw error
            setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: newContent, is_edited: true } : m)))
            toast.success("Message modifié")
        } catch (err: unknown) {
            console.error("Error updating message", err)
            toast.error(`Échec de la modification : ${(err as { message?: string })?.message || "Erreur réseau"}`)
        }
    }, [supabase, setMessages])

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        if (!messageId) return
        try {
            const { error } = await supabase.from("messages").delete().eq("id", messageId)
            if (error) throw error
            setMessages((prev) => prev.filter((m) => m.id !== messageId))
            toast.success("Message supprimé")
        } catch (err: unknown) {
            console.error("Error deleting message", err)
            toast.error(`Échec de la suppression : ${(err as { message?: string })?.message || "Erreur réseau"}`)
        }
    }, [supabase, setMessages])

    const handleResendMessage = useCallback(async (failedMsg: Message) => {
        if (!failedMsg || !selectedConv) return
        setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id))
        await handleSendMessage(failedMsg.content)
    }, [selectedConv, handleSendMessage, setMessages])

    return {
        handleSendMessage,
        handleEditMessage,
        handleDeleteMessage,
        handleResendMessage,
    }
}
