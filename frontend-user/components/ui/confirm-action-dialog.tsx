/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dialogue de confirmation générique réutilisable
 * @created 2026-05-11
*/

import React from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  isLoading?: boolean
}

export const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = 'default',
  isLoading = false,
}) => {
  const Icon = variant === 'destructive' || variant === 'warning' ? AlertTriangle : Info
  const iconColor = variant === 'destructive' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-indigo-600'
  const iconBg = variant === 'destructive' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-indigo-100'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-4", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="rounded-xl">
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className={cn(
              "rounded-xl font-bold",
              variant === 'warning' && "bg-amber-600 hover:bg-amber-700 text-white"
            )}
          >
            {isLoading ? "Chargement..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
