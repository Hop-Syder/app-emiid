/**
 * Message — icône animée (rebond de la bulle + points « en train d'écrire »).
 * Adapté d'AnimateIcons (Avijit Dey, MIT) à framer-motion.
 */
"use client"

import { m, type Variants } from "framer-motion"
import { forwardRef } from "react"
import { IconShell } from "./icon-shell"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

export const MessageIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
    (props, ref) => {
        const d = props.duration ?? 1
        const bubbleVariants: Variants = {
            normal: { scale: 1 },
            animate: {
                scale: [0.8, 1.1, 0.96, 1],
                transition: { duration: 0.5 * d, times: [0, 0.5, 0.8, 1], ease: "easeOut" },
            },
        }
        // Les points clignotent puis disparaissent (retour à opacity 0 = bulle nue au repos).
        const dot = (delay: number): Variants => ({
            normal: { opacity: 0 },
            animate: {
                opacity: [0, 1, 0],
                transition: { duration: 0.5 * d, delay: delay * d, times: [0, 0.5, 1] },
            },
        })
        return (
            <IconShell ref={ref} {...props}>
                <m.g
                    variants={bubbleVariants}
                    style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
                >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    <m.circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" variants={dot(0.15)} />
                    <m.circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" variants={dot(0.28)} />
                    <m.circle cx="16" cy="12" r="0.6" fill="currentColor" stroke="none" variants={dot(0.41)} />
                </m.g>
            </IconShell>
        )
    },
)

MessageIcon.displayName = "MessageIcon"
