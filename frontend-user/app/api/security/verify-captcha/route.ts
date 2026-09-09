/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description API Route — Vérification du jeton Cloudflare Turnstile pour la
 *              réauthentification par mot de passe (paramètres de sécurité).
 *
 *              Volontairement indépendante de la protection captcha déjà
 *              activée sur le projet Supabase (Auth > Attack Protection) :
 *              ce réglage est unique pour tout le projet et déjà apparié à la
 *              clé dédiée du back-office (app-admin.emiid.com) — le
 *              réutiliser ici casserait le login admin en prod. Cette route
 *              appelle donc `siteverify` elle-même avec le secret dédié à
 *              app.emiid.com (TURNSTILE_SECRET_KEY), avant que le client
 *              n'appelle `supabase.auth.signInWithPassword`.
 * @created 2026-09-09
 */

import { NextRequest, NextResponse } from "next/server"

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()
        if (typeof token !== "string" || !token || token.length > 2048) {
            return NextResponse.json({ success: false }, { status: 400 })
        }

        const secret = process.env.TURNSTILE_SECRET_KEY
        if (!secret) {
            console.error("TURNSTILE_SECRET_KEY manquante")
            return NextResponse.json({ success: false }, { status: 500 })
        }

        const remoteip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()

        const verifyRes = await fetch(SITEVERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret,
                response: token,
                ...(remoteip ? { remoteip } : {}),
            }),
            signal: AbortSignal.timeout(10_000),
        })

        if (!verifyRes.ok) {
            return NextResponse.json({ success: false }, { status: 502 })
        }

        const result = await verifyRes.json()
        return NextResponse.json({ success: result?.success === true })
    } catch {
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
