/**
 * @author @hopsyder — Nexus Partners
 * @description Types partagés des icônes animées.
 *              Style inspiré d'AnimateIcons (Avijit Dey, MIT — animateicons.in),
 *              adapté à framer-motion (stack EmiID).
 * @created 2026-08-22
 */

import type { HTMLAttributes } from "react"

/** Poignée impérative : permet de déclencher l'animation depuis le parent. */
export interface AnimatedIconHandle {
    startAnimation: () => void
    stopAnimation: () => void
}

export interface AnimatedIconProps
    extends Omit<
        HTMLAttributes<HTMLDivElement>,
        | "color"
        | "onDrag"
        | "onDragStart"
        | "onDragEnd"
        | "onAnimationStart"
        | "onAnimationEnd"
        | "onAnimationIteration"
    > {
    size?: number
    duration?: number
    /** Anime au survol (desktop). Le déclenchement impératif reste toujours possible. */
    isAnimated?: boolean
    color?: string
    strokeWidth?: number
}
