/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'entrée de texte pour la messagerie
 * @created 2026-05-11
 * @updated 2026-05-27
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React, { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { EmojiPickerPopover } from './emoji-picker-popover'

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
}

// === COMPOSANT DE SAISIE DE MESSAGE ===
export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isDisabled }) => {
  // === ÉTATS ET RÉFÉRENCES ===
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // === GESTION DE LA SOUMISSION ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) return

    const type = isSingleEmoji(text) ? 'emoji' : 'text'
    onSend(text, type, file || undefined)
    setText('')
    setFile(null)
  }

  // === INSERTION D'EMOJI ===
  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji)
  }

  // === RENDU DU COMPOSANT ===
  return (
    <div className="p-4 bg-transparent pb-safe">
      <form 
        onSubmit={handleSubmit}
        className="flex items-end gap-3 max-w-4xl mx-auto bg-white/80 backdrop-blur-xl p-2 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white"
      >
        <div className="flex-1 relative bg-slate-50/50 rounded-[20px] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20">
        <input 
          id="message-file-input"
          name="message_file"
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
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
          className="absolute left-1 bottom-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Input 
          id="message-text-input"
          name="message_text"
          autoComplete="off"
          placeholder="Message..." 
          className="border-none bg-transparent pl-11 pr-11 h-11 focus-visible:ring-0 shadow-none font-medium text-[15px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDisabled}
        />

        <EmojiPickerPopover
          onEmojiSelect={handleEmojiSelect}
          disabled={isDisabled}
        />
      </div>

      <Button 
        type="submit" 
        size="icon" 
        disabled={isDisabled || (!text.trim() && !file)}
        className="h-11 w-11 rounded-[20px] bg-primary hover:bg-primary/90 shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
      >
        <Send className="h-4 w-4 ml-0.5" />
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
