/* eslint-disable no-console */
import { logger } from "@/lib/logger"

type ErrorContext = Record<string, unknown>

function normalizeError(err: unknown): { message: string; name?: string; stack?: string } {
  if (err instanceof Error) {
    return { message: err.message, name: err.name, stack: err.stack }
  }
  if (typeof err === "string") return { message: err }
  try {
    return { message: JSON.stringify(err) }
  } catch {
    return { message: "Unknown error" }
  }
}

export function captureError(err: unknown, context: ErrorContext = {}) {
  const normalized = normalizeError(err)

  // Local log (dev) / error log (prod if configured)
  logger.error(normalized.message, { ...normalized, context })

  // Placeholder for future remote reporting (Sentry-like)
  // Enable only when you decide to open the network + add an API route.
  const enabled = process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "true"
  if (!enabled) return

  try {
    void fetch("/api/observability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: normalized, context, ts: new Date().toISOString() }),
      keepalive: true,
    })
  } catch (e) {
    console.warn("Observability report failed", e)
  }
}

