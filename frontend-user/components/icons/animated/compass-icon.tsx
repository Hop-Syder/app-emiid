/**
 * Compass — icône animée (l'aiguille pivote comme une boussole).
 * Adapté d'AnimateIcons (Avijit Dey, MIT) à framer-motion.
 */
"use client"

import { m, type Variants } from "framer-motion"
import { forwardRef } from "react"
import { IconShell } from "./icon-shell"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

export const CompassIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (props, ref) => {
        const d = props.duration ?? 1
        const ringVariants: Variants = {
            normal: { scale: 1 },
            animate: {
                scale: [1, 1.08, 1],
                transition: { duration: 0.5 * d, ease: "easeOut" },
            },
        }
        const needleVariants: Variants = {
            normal: { rotate: 0 },
            animate: {
                rotate: [0, -35, 22, -8, 0],
                transition: { duration: 0.75 * d, ease: "easeInOut" },
            },
        }
        return (
            <IconShell ref={ref} {...props}>
                <m.circle
                    cx="12"
                    cy="12"
                    r="10"
                    variants={ringVariants}
                    style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
                />
                <m.polygon
                    points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                    variants={needleVariants}
                    style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
                />
            </IconShell>
        )
    },
)

CompassIcon.displayName = "CompassIcon"
