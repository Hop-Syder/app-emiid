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
  colorTheme?: "default" | "red" | "orange";
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction, colorTheme = "default" }: EmptyStateProps) {
  const isRed = colorTheme === "red";
  const isOrange = colorTheme === "orange";
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed ${isRed ? 'border-red-100 bg-red-50/30' : isOrange ? 'border-orange-100 bg-orange-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
      <div className={`p-4 rounded-2xl shadow-sm mb-4 ${isRed ? 'bg-red-50' : isOrange ? 'bg-orange-50' : 'bg-white'}`}>
        <Icon className={`h-8 w-8 ${isRed ? 'text-red-500' : isOrange ? 'text-orange-500' : 'text-slate-400'}`} />
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6 font-medium">{description}</p>
      {actionText && onAction && (
        <Button 
          variant="outline" 
          className={`rounded-xl font-bold ${isRed ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' : isOrange ? 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}
