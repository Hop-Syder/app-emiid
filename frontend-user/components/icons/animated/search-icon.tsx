/**
 * Search — icône animée (la loupe « scanne » + le manche se trace).
 * Adapté d'AnimateIcons (Avijit Dey, MIT) à framer-motion.
 */
"use client"

import { m, type Variants } from "framer-motion"
import { forwardRef } from "react"
import { IconShell } from "./icon-shell"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

export const SearchIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (props, ref) => {
        const d = props.duration ?? 1
        const glassVariants: Variants = {
            normal: { scale: 1, rotate: 0 },
            animate: {
                scale: [0.85, 1.06, 1],
                rotate: [0, -8, 6, 0],
                transition: { duration: 0.6 * d, ease: "easeOut" },
            },
        }
        const handleVariants: Variants = {
            normal: { pathLength: 1, opacity: 1 },
            animate: {
                pathLength: [0, 1],
                opacity: [0.3, 1],
                transition: { duration: 0.35 * d, delay: 0.15 * d, ease: "easeOut" },
            },
        }
        return (
            <IconShell ref={ref} {...props}>
                <m.g
                    variants={glassVariants}
                    style={{ transformBox: "view-box", originX: "11px", originY: "11px" }}
                >
                    <circle cx="11" cy="11" r="8" />
                    <m.path d="m21 21-4.3-4.3" variants={handleVariants} />
                </m.g>
            </IconShell>
        )
    },
)

SearchIcon.displayName = "SearchIcon"
