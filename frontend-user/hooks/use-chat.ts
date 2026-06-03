/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de gestion des conversations, messages et requêtes de connexion avec Supabase Realtime
 * @created 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ConnectionStatus = 'pending' | 'accepted' | 'declined'

export interface UserProfileBasic {
  user_id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  professional_title: string | null
}

export interface Connection {
  id: string
  sender_id: string
  receiver_id: string
  status: ConnectionStatus
  created_at: string
  // Profil joint
  profile?: UserProfileBasic 
}

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_content: string | null
  last_message_at: string | null
  created_at: string
  // Profil de l'interlocuteur
  other_participant?: UserProfileBasic
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export function useChat() {
  const supabase = createClient()
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // 1. Initialiser l'utilisateur courant
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user.id)
      }
    })
  }, [supabase])

  // 2. Charger les conversations et les connexions
  const loadInitialData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      // -- A. Charger les Conversations --
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (convError) throw convError

      // Récupérer les profils pour chaque interlocuteur
      const enrichedConvs = await Promise.all((convData || []).map(async (conv) => {
        const otherId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, avatar_url, professional_title')
          .eq('user_id', otherId)
          .single()
        
        return { ...conv, other_participant: profile } as Conversation
      }))
      setConversations(enrichedConvs)

      // -- B. Charger les Connexions (Demandes en attente) --
      const { data: connData, error: connError } = await supabase
        .from('connections')
        .select('*')
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (connError) throw connError

      const enrichedConns = await Promise.all((connData || []).map(async (conn) => {
        const otherId = conn.sender_id === userId ? conn.receiver_id : conn.sender_id
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, avatar_url, professional_title')
          .eq('user_id', otherId)
          .single()
        
        return { ...conn, profile } as Connection
      }))
      setConnections(enrichedConns)

    } catch (err) {
      console.error("Erreur lors du chargement des données de chat", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (currentUser) {
      loadInitialData(currentUser)
    }
  }, [currentUser, loadInitialData])

  // 3. Charger les messages d'une conversation spécifique
  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      setActiveConversationId(conversationId)
    } catch (err) {
      console.error("Erreur chargement messages", err)
    } finally {
      setMessagesLoading(false)
    }
  }, [supabase])

  // 4. Souscriptions Realtime
  useEffect(() => {
    if (!currentUser) return

    // Écoute des nouveaux messages
    const messageChannel = supabase.channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message
        
        // Si on est dans la conversation, on ajoute le message à la liste
        if (activeConversationId === newMsg.conversation_id) {
          setMessages(prev => [...prev, newMsg])
        }
        
        // On met à jour la sidebar
        setConversations(prev => prev.map(conv => {
          if (conv.id === newMsg.conversation_id) {
            return {
              ...conv,
              last_message_content: newMsg.content,
              last_message_at: newMsg.created_at
            }
          }
          return conv
        }).sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()))
      })
      .subscribe()

    // Écoute des nouvelles connexions
    const connectionChannel = supabase.channel('connections-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections', filter: `receiver_id=eq.${currentUser}` }, () => {
        loadInitialData(currentUser)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'connections' }, () => {
        loadInitialData(currentUser)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(connectionChannel)
    }
  }, [currentUser, activeConversationId, supabase, loadInitialData])


  // -- ACTIONS --

  const sendMessage = async (conversationId: string, content: string) => {
    if (!currentUser || !content.trim()) return null
    
    // Le Realtime se chargera de l'ajouter à la liste si on est l'expéditeur
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error("Erreur envoi message:", error)
      return null
    }
    return data
  }

  const startConversation = async (participantId: string) => {
    if (!currentUser) return null
    
    // Vérifier si elle existe
    const existing = conversations.find(c => 
      c.participant1_id === participantId || c.participant2_id === participantId
    )
    if (existing) {
      setActiveConversationId(existing.id)
      loadMessages(existing.id)
      return existing.id
    }

    // Créer une nouvelle conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: currentUser,
        participant2_id: participantId
      })
      .select()
      .single()

    if (!error && data) {
      loadInitialData(currentUser)
      setActiveConversationId(data.id)
      setMessages([])
      return data.id
    }
    return null
  }

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId)
      
    if (!error) {
      setConnections(prev => prev.filter(c => c.id !== connectionId))
      if (status === 'accepted' && currentUser) {
        loadInitialData(currentUser)
      }
    }
  }

  const clearActiveConversation = () => {
    setActiveConversationId(null)
    setMessages([])
  }

  return {
    currentUser,
    loading,
    messagesLoading,
    conversations,
    connections,
    messages,
    activeConversationId,
    loadMessages,
    sendMessage,
    startConversation,
    respondToConnection,
    clearActiveConversation
  }
}
