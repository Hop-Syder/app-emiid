/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'entrée de texte pour la messagerie
 * @created 2026-05-11
 * @updated 2026-06-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { EmojiPickerPopover } from './emoji-picker-popover'
import { Message } from './types'

// Détecte si un texte est un emoji unique (ou combinaison simple)
const isSingleEmoji = (str: string): boolean => {
  const trimmed = str.trim()
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})(\uFE0F|\u200D\p{Emoji})*$/u
  return emojiRegex.test(trimmed) && trimmed.length <= 8
}

// === INTERFACES ===
interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'emoji', file?: File) => void
  isDisabled: boolean
  editingMessage: Message | null
  onCancelEdit: () => void
  onEditSubmit: (messageId: string, content: string) => void
}

// === COMPOSANT DE SAISIE DE MESSAGE ===
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isDisabled,
  editingMessage,
  onCancelEdit,
  onEditSubmit,
}) => {
  // === ÉTATS ET RÉFÉRENCES ===
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ajuster la hauteur du textarea en fonction du contenu
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = '24px' // Hauteur de base interne
    const scrollHeight = textarea.scrollHeight
    // Limite à 140px de hauteur max
    textarea.style.height = `${Math.min(scrollHeight, 140)}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [text])

  // Hydrater le champ lors de l'édition
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content)
      textareaRef.current?.focus()
      setTimeout(adjustHeight, 50)
    } else {
      setText('')
    }
  }, [editingMessage])

  // === GESTION DE LA SOUMISSION ===
  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) return

    if (editingMessage) {
      onEditSubmit(editingMessage.id, text.trim())
      onCancelEdit()
    } else {
      const type = isSingleEmoji(text) ? 'emoji' : 'text'
      onSend(text.trim(), type, file || undefined)
      setFile(null)
    }

    setText('')
    
    // Réinitialiser la hauteur
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px'
    }
  }

  // === INSERTION D'EMOJI ===
  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji)
    // Placer le focus après l'insertion
    textareaRef.current?.focus()
  }

  // Soumission via la touche Enter (sans Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // === RENDU DU COMPOSANT ===
  return (
    <div className="px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-slate-100/80 shrink-0">
      {/* Bannière de modification de message */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 mb-2 animate-in slide-in-from-bottom-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="truncate">
              Modification du message : <span className="font-normal italic text-slate-500">"{editingMessage.content}"</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-indigo-600 hover:text-red-500 font-bold ml-2 text-xs shrink-0"
          >
            Annuler
          </button>
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex items-end gap-2.5 bg-slate-50/80 p-1.5 rounded-[24px] border border-slate-200/60 transition-all focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] focus-within:bg-white"
      >
        <div className="flex-1 relative bg-slate-50/50 rounded-[20px] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 flex items-end">
          <input 
            id="message-file-input"
            name="message_file"
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            disabled={!!editingMessage || isDisabled}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
                toast.error("Le fichier est trop volumineux (max 10 Mo)")
                return
              }
              setFile(selectedFile || null)
            }}
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl h-9 w-9 m-1 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!editingMessage || isDisabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <textarea 
            ref={textareaRef}
            id="message-text-input"
            name="message_text"
            rows={1}
            placeholder={editingMessage ? "Modifier le message..." : "Message..."} 
            className="flex-1 border-none bg-transparent pl-2 pr-11 py-3 focus:outline-none focus:ring-0 shadow-none font-medium text-[15px] resize-none overflow-y-auto max-h-[140px] leading-relaxed text-slate-800 self-center"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            style={{ height: '24px' }}
          />

          <div className="absolute right-1 bottom-1">
            <EmojiPickerPopover
              onEmojiSelect={handleEmojiSelect}
              disabled={isDisabled}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled || (!text.trim() && !file)}
          className={cn(
            "h-9 w-9 rounded-full shadow-sm transition-all duration-200 shrink-0",
            text.trim() || file
              ? "bg-primary hover:bg-primary/90 text-white scale-100 hover:scale-105 active:scale-95 shadow-primary/30"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          <Send className="h-3.5 w-3.5 ml-0.5" />
        </Button>

        {file && (
          <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-80 bg-white/95 backdrop-blur-md border border-white shadow-xl rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xs">
              {file.name.split('.').pop()?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 flex-1 truncate">{file.name}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              onClick={() => setFile(null)}
            >
              &times;
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
