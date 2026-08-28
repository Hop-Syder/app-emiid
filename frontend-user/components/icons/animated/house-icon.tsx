/**
 * House — icône animée (rebond + ouverture de la porte).
 * Adapté d'AnimateIcons (Avijit Dey, MIT) à framer-motion.
 */
"use client"

import { m, type Variants } from "framer-motion"
import { forwardRef } from "react"
import { IconShell } from "./icon-shell"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

export const HouseIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (props, ref) => {
        const d = props.duration ?? 1
        const houseVariants: Variants = {
            normal: { scale: 1 },
            animate: {
                scale: [0.7, 1.06, 0.98, 1],
                transition: { duration: 0.55 * d, times: [0, 0.55, 0.8, 1], ease: "easeOut" },
            },
        }
        const doorVariants: Variants = {
            normal: { scaleY: 1, opacity: 1 },
            animate: {
                scaleY: [0, 1],
                opacity: [0, 1],
                transition: { duration: 0.3 * d, delay: 0.35 * d, ease: "easeOut" },
            },
        }
        return (
            <IconShell ref={ref} {...props}>
                <m.g
                    variants={houseVariants}
                    style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}
                >
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10" />
                    <path d="M21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9" />
                    <m.path
                        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
                        variants={doorVariants}
                        style={{ transformBox: "view-box", originX: "12px", originY: "21px" }}
                    />
                </m.g>
            </IconShell>
        )
    },
)

HouseIcon.displayName = "HouseIcon"
