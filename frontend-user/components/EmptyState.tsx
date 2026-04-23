/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'état vide pour EmiID
 * @created 2026-04-19
*/

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30">
      <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6 font-medium">{description}</p>
      {actionText && onAction && (
        <Button 
          variant="outline" 
          className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}
