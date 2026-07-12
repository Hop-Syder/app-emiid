/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Cron : traite les annonces programmées dues (P2 #11).
 *              Protégé par CRON_SECRET (header Authorization: Bearer, ou ?secret=).
 * @created 2026-07-12
 */

import { NextRequest, NextResponse } from "next/server"
import { processDueScheduledBroadcasts } from "@/lib/actions/admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const header = req.headers.get("authorization")
  const provided = header?.startsWith("Bearer ") ? header.slice(7) : req.nextUrl.searchParams.get("secret")

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processDueScheduledBroadcasts()
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Erreur" }, { status: 500 })
  }
}

// GET pour Vercel Cron (envoie Authorization: Bearer CRON_SECRET) ; POST pour pg_net.
export const GET = handle
export const POST = handle
