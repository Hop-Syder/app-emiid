/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description En-tête des écrans mobiles (< lg), façon WhatsApp : titre (ou
 *              logo) à gauche ou centré, actions icônes à droite, collant en
 *              haut avec un léger flou. Masqué sur ordinateur, où l'app bar
 *              du shell prend le relais.
 * @created 2026-10-09
 */

import { cn } from "@/lib/utils"

interface MobileTopBarProps {
  title: React.ReactNode
  /** Actions à droite (boutons icônes de 44 px). */
  actions?: React.ReactNode
  /** Contenu sous le titre (recherche, onglets…), dans la même zone collante. */
  children?: React.ReactNode
  centered?: boolean
  className?: string
}

export function MobileTopBar({ title, actions, children, centered = false, className }: MobileTopBarProps) {
  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-4", centered && "justify-center relative")}>
        <div className={cn("min-w-0", centered ? "text-center" : "flex-1")}>
          {typeof title === "string" ? (
            <h1 className="truncate text-xl font-black tracking-tight text-foreground">{title}</h1>
          ) : (
            title
          )}
        </div>
        {actions && (
          <div className={cn("flex items-center", centered && "absolute right-2")}>{actions}</div>
        )}
      </div>
      {children}
    </header>
  )
}

/** Bouton icône rond de 44 px pour la barre du haut. */
export function TopBarIconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground active:bg-muted"
      {...props}
    >
      {children}
    </button>
  )
}
