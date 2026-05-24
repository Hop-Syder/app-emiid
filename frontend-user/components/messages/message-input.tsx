/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'entrée de texte pour la messagerie
 * @created 2026-05-11
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import React, { useState, useRef } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface MessageInputProps {
  onSend: (content: string, file?: File) => void
  isDisabled: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isDisabled }) => {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) return

    onSend(text, file || undefined)
    setText('')
    setFile(null)
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t flex items-end gap-3 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]"
    >
      <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-100 transition-all focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
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
          className="absolute left-1 bottom-1 text-slate-400 hover:text-indigo-600 rounded-xl"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input 
          id="message-text-input"
          name="message_text"
          autoComplete="off"
          placeholder="Écrivez votre message..." 
          className="border-none bg-transparent pl-12 pr-12 h-11 focus-visible:ring-0 shadow-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDisabled}
        />

        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 bottom-1 text-slate-400 hover:text-amber-500 rounded-xl"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </div>

      <Button 
        type="submit" 
        size="icon" 
        disabled={isDisabled || (!text.trim() && !file)}
        className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>

      {file && (
        <div className="absolute bottom-20 left-4 bg-white border rounded-lg p-2 flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom-2">
          <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-700 text-xs">
            {file.name.split('.').pop()?.toUpperCase()}
          </div>
          <span className="text-xs text-slate-600 truncate max-w-[150px]">{file.name}</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400"
            onClick={() => setFile(null)}
          >
            &times;
          </Button>
        </div>
      )}
    </form>
  )
}
