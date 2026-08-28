/**
 * User — icône animée (léger rebond + tête qui « hoche »).
 * Adapté d'AnimateIcons (Avijit Dey, MIT) à framer-motion.
 */
"use client"

import { m, type Variants } from "framer-motion"
import { forwardRef } from "react"
import { IconShell } from "./icon-shell"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

export const UserIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (props, ref) => {
        const d = props.duration ?? 1
        const groupVariants: Variants = {
            normal: { scale: 1 },
            animate: {
                scale: [0.85, 1.08, 0.97, 1],
                transition: { duration: 0.5 * d, times: [0, 0.5, 0.8, 1], ease: "easeOut" },
            },
        }
        const headVariants: Variants = {
            normal: { y: 0 },
            animate: {
                y: [0, -1.5, 0],
                transition: { duration: 0.45 * d, ease: "easeOut" },
            },
        }
        return (
            <IconShell ref={ref} {...props}>
                <m.g
                    variants={groupVariants}
                    style={{ transformBox: "view-box", originX: "12px", originY: "20px" }}
                >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <m.circle cx="12" cy="7" r="4" variants={headVariants} />
                </m.g>
            </IconShell>
        )
    },
)

UserIcon.displayName = "UserIcon"
