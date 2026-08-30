/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant picker d'emojis pour la messagerie EmiID
 * @created 2026-05-27
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Chargement dynamique pour éviter les erreurs SSR (Next.js)
let Picker: React.ComponentType<{ data: unknown; onEmojiSelect: (emoji: { native: string }) => void; [key: string]: unknown }> | null = null

declare global {
  interface Window { __emojiMartData: unknown }
}

interface EmojiPickerPopoverProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

// === COMPOSANT PICKER EMOJI ===
export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  onEmojiSelect,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [pickerReady, setPickerReady] = useState(false)

  // Chargement dynamique côté client uniquement (pas de SSR)
  useEffect(() => {
    if (!Picker) {
      Promise.all([
        import('@emoji-mart/react'),
        import('@emoji-mart/data'),
      ]).then(([mod, dataMod]) => {
        Picker = mod.default
        // Précharger les données d'emojis dans le module
        window.__emojiMartData = dataMod.default
        setPickerReady(true)
      })
    } else {
      setPickerReady(true)
    }
  }, [])

  const handleEmojiSelect = (emoji: { native: string }) => {
    onEmojiSelect(emoji.native)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="absolute right-1 bottom-1 text-slate-400 hover:text-amber-500 rounded-xl transition-colors"
          aria-label="Ouvrir le picker d'emojis"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="p-0 border-none shadow-2xl w-auto bg-transparent"
      >
        {pickerReady && Picker ? (
          <Picker
            data={window.__emojiMartData}
            onEmojiSelect={handleEmojiSelect}
            locale="fr"
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
            searchPosition="sticky"
            navPosition="top"
            perLine={8}
            maxFrequentRows={2}
            set="native"
          />
        ) : (
          <div className="w-[352px] h-[400px] flex items-center justify-center bg-card rounded-xl">
            <span className="text-slate-400 text-sm animate-pulse">Chargement...</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
