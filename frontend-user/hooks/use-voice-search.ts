/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dictée vocale pour les champs de recherche (Web Speech API).
 *              Encapsule la détection du support, le cycle écoute/arrêt et la
 *              restitution du texte reconnu, pour qu'une barre de recherche
 *              n'ait plus à connaître l'API du navigateur.
 *
 *              Le support est volontairement détecté APRÈS montage : l'API
 *              n'existe pas côté serveur, et l'annoncer au rendu produirait une
 *              différence d'hydratation. Tant qu'elle n'est pas confirmée,
 *              `available` reste false et le bouton micro n'est pas affiché —
 *              plutôt qu'un bouton qui ne ferait rien (Firefox mobile, etc.).
 * @created 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseVoiceSearchOptions {
    /** Appelé avec la phrase reconnue, une fois la dictée terminée. */
    onResult: (transcript: string) => void
    /** Appelé en continu avec la transcription temporaire pendant que l'utilisateur parle. */
    onInterim?: (interim: string) => void
    /** Langue de reconnaissance (par défaut le français). */
    lang?: string
}

interface UseVoiceSearchResult {
    /** true si le navigateur sait dicter — connu seulement après montage. */
    available: boolean
    /** true pendant l'écoute (sert à animer le bouton). */
    listening: boolean
    /** Démarre ou arrête la dictée. */
    toggle: () => void
    /** Force le démarrage de la dictée. */
    start: () => void
    /** Force l'arrêt de la dictée. */
    stop: () => void
}

export function useVoiceSearch({
    onResult,
    onInterim,
    lang = "fr-FR",
}: UseVoiceSearchOptions): UseVoiceSearchResult {
    const [available, setAvailable] = useState(false)
    const [listening, setListening] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
    const recognitionRef = useRef<any>(null)

    // Les callbacks sont gardés dans des refs pour ne pas capturer de versions périmées.
    const onResultRef = useRef(onResult)
    useEffect(() => {
        onResultRef.current = onResult
    }, [onResult])

    const onInterimRef = useRef(onInterim)
    useEffect(() => {
        onInterimRef.current = onInterim
    }, [onInterim])

    useEffect(() => {
        if (typeof window === "undefined") return
        const SR =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) return

        setAvailable(true)
        const recognition = new SR()
        recognition.lang = lang
        recognition.interimResults = Boolean(onInterimRef.current)
        recognition.maxAlternatives = 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
        recognition.onresult = (event: any) => {
            let interim = ""
            let final = ""
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const item = event.results[i]
                if (item?.isFinal) {
                    final += item[0]?.transcript || ""
                } else {
                    interim += item[0]?.transcript || ""
                }
            }

            if (interim && onInterimRef.current) {
                onInterimRef.current(interim.trim())
            }

            if (final) {
                setListening(false)
                const clean = final.trim()
                if (clean) onResultRef.current(clean)
            }
        }
        recognition.onend = () => setListening(false)
        recognition.onerror = () => setListening(false)

        recognitionRef.current = recognition
        return () => {
            try {
                recognition.stop()
            } catch {
                /* déjà arrêtée */
            }
        }
    }, [lang])

    const start = useCallback(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        try {
            recognition.start()
            setListening(true)
        } catch {
            setListening(false)
        }
    }, [])

    const stop = useCallback(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        try {
            recognition.stop()
        } catch {
            /* déjà arrêtée */
        }
        setListening(false)
    }, [])

    const toggle = useCallback(() => {
        if (listening) {
            stop()
        } else {
            start()
        }
    }, [listening, start, stop])

    return { available, listening, toggle, start, stop }
}
