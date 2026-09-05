/**
 * @author @hopsyder — Nexus Partners
 * @description Enveloppe commune des icônes animées : gère la mécanique
 *              (LazyMotion/domAnimation, contrôleur d'animation, survol,
 *              poignée impérative startAnimation/stopAnimation) et propage
 *              l'état de variante ("normal"/"animate") aux <m.*> enfants.
 *
 *              Inspiré d'AnimateIcons (Avijit Dey, MIT), porté à framer-motion.
 * @created 2026-08-22
 */

"use client"

import { cn } from "@/lib/utils"
import {
    LazyMotion,
    domAnimation,
    m,
    useAnimation,
    useReducedMotion,
} from "framer-motion"
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    type ReactNode,
} from "react"
import type { AnimatedIconHandle, AnimatedIconProps } from "./types"

interface IconShellProps extends AnimatedIconProps {
    /** Contenu SVG (paths/groupes avec variants "normal"/"animate"). */
    children: ReactNode
}

export const IconShell = forwardRef<AnimatedIconHandle, IconShellProps>(
    (
        {
            onMouseEnter,
            onMouseLeave,
            className,
            size = 24,
            isAnimated = true,
            color,
            strokeWidth = 2,
            children,
            ...props
        },
        ref,
    ) => {
        const controls = useAnimation()
        const reduced = useReducedMotion()
        const isControlled = useRef(false)

        useImperativeHandle(ref, () => {
            isControlled.current = true
            return {
                startAnimation: () =>
                    reduced ? controls.start("normal") : controls.start("animate"),
                stopAnimation: () => controls.start("normal"),
            }
        })

        const handleEnter = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!isAnimated || reduced) return
                if (!isControlled.current) controls.start("animate")
                else onMouseEnter?.(e)
            },
            [controls, reduced, isAnimated, onMouseEnter],
        )

        const handleLeave = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (!isControlled.current) controls.start("normal")
                else onMouseLeave?.(e)
            },
            [controls, onMouseLeave],
        )

        return (
            <LazyMotion features={domAnimation} strict>
                <m.div
                    className={cn("inline-flex items-center justify-center", className)}
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                    {...props}
                    style={{ color, ...props.style }}
                >
                    <m.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={controls}
                        initial="normal"
                    >
                        {children}
                    </m.svg>
                </m.div>
            </LazyMotion>
        )
    },
)

IconShell.displayName = "IconShell"

/** Multiplicateur de durée par défaut, exposé pour cohérence des variants. */
export const dur = (base: number, duration = 1) => base * duration
