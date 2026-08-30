/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dialogue moderne pour demander une médiation
 * @created 2026-05-11
*/

import React, { useState } from 'react'
import { Gavel, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MediationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading: boolean
}

export const MediationDialog: React.FC<MediationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState('')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-4">
            <Gavel className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">Demander une Médiation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Un modérateur EmiID interviendra pour aider à résoudre ce litige. Expliquez brièvement le problème.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Détails du litige (ex: non-respect des termes, comportement inapproprié...)"
            className="min-h-[120px] bg-muted border-border focus:ring-[#013ff4] rounded-xl"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight">
              La médiation est un processus sérieux. L&apos;historique des messages sera partagé avec le modérateur.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={() => onConfirm(reason)} 
            disabled={isLoading || !reason.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? "Envoi..." : "Envoyer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
