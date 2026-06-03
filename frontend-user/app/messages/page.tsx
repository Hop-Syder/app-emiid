"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatSidebar } from '@/components/messages/chat-sidebar'
import { ChatWindow } from '@/components/messages/chat-window'
import { useChat } from '@/hooks/use-chat'
import { NavigationShell } from '@/components/navigation/navigation-shell'
import { cn } from '@/lib/utils'

function MessagesContent() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get('contact')

  const {
    currentUser,
    loading,
    messagesLoading,
    conversations,
    connections,
    messages,
    activeConversationId,
    activeConnection,
    loadMessages,
    sendMessage,
    startConversation,
    sendConnectionRequest,
    respondToConnection,
    clearActiveConversation
  } = useChat()

  // Gérer le paramètre contact de l'URL
  useEffect(() => {
    if (contactId && currentUser && !loading) {
      startConversation(contactId)
    }
  }, [contactId, currentUser, loading]) // On omet startConversation pour éviter les boucles infinies, il est stable

  const handleSelectConversation = (id: string) => {
    loadMessages(id)
  }

  const handleBack = () => {
    clearActiveConversation()
  }

  return (
    <main className="flex-1 flex overflow-hidden relative min-h-[calc(100vh-80px)]">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex w-full h-full absolute inset-0">
          {/* Sidebar : cachée sur mobile si une conversation est ouverte */}
          <div className={cn(
            "h-full shrink-0 transition-all duration-300 md:block bg-white",
            activeConversationId ? "hidden w-0 md:w-80 lg:w-96" : "w-full md:w-80 lg:w-96"
          )}>
            <ChatSidebar
              conversations={conversations}
              connections={connections}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onRespondConnection={respondToConnection}
              className="w-full"
            />
          </div>

          {/* Fenêtre de chat : cachée sur mobile si aucune conversation n'est ouverte */}
          <div className={cn(
            "flex-1 h-full bg-white transition-all duration-300 md:flex",
            !activeConversationId ? "hidden md:flex" : "flex"
          )}>
            <ChatWindow
              conversation={conversations.find(c => c.id === activeConversationId) || null}
              messages={messages}
              currentUserId={currentUser}
              loading={messagesLoading}
              onSendMessage={(content) => {
                if (activeConversationId) sendMessage(activeConversationId, content)
              }}
              onBack={handleBack}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default function MessagesPage() {
  return (
    <NavigationShell isPublic={false}>
      <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
          <MessagesContent />
        </Suspense>
      </div>
    </NavigationShell>
  )
}
