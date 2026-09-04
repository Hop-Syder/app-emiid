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
}

export function useVoiceSearch({
    onResult,
    lang = "fr-FR",
}: UseVoiceSearchOptions): UseVoiceSearchResult {
    const [available, setAvailable] = useState(false)
    const [listening, setListening] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
    const recognitionRef = useRef<any>(null)

    // Le callback est gardé dans un ref : la reconnaissance n'est instanciée
    // qu'une fois, et ne doit pas capturer une version périmée du gestionnaire.
    const onResultRef = useRef(onResult)
    useEffect(() => {
        onResultRef.current = onResult
    }, [onResult])

    useEffect(() => {
        if (typeof window === "undefined") return
        const SR =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) return

        setAvailable(true)
        const recognition = new SR()
        recognition.lang = lang
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API navigateur non typée
        recognition.onresult = (event: any) => {
            const transcript = event?.results?.[0]?.[0]?.transcript || ""
            setListening(false)
            const clean = transcript.trim()
            if (clean) onResultRef.current(clean)
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

    const toggle = useCallback(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        if (listening) {
            recognition.stop()
            setListening(false)
            return
        }
        try {
            recognition.start()
            setListening(true)
        } catch {
            // start() lève si une session est déjà en cours : on se resynchronise.
            setListening(false)
        }
    }, [listening])

    return { available, listening, toggle }
}
