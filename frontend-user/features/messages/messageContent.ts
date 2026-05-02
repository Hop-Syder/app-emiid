export type ParsedMessageContent =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string }
  | { kind: "file"; name: string; url: string }
  | { kind: "mediation"; text: string }

const MEDIATION_PREFIXES = ["⚠️ [MÉDIATION DEMANDÉE]", "[MÉDIATION DEMANDÉE]"]

export function parseMessageContent(raw: string): ParsedMessageContent {
  const value = typeof raw === "string" ? raw : ""

  if (MEDIATION_PREFIXES.some((p) => value.includes(p))) {
    return {
      kind: "mediation",
      text: value.replace("⚠️ [MÉDIATION DEMANDÉE] ", "").replace("[MÉDIATION DEMANDÉE] ", ""),
    }
  }

  if (value.startsWith("[Image]")) {
    const url = value.split(" ")[1]?.trim()
    if (url) return { kind: "image", url }
  }

  if (value.startsWith("[Fichier]")) {
    const [left, right] = value.split(" - ")
    const name = left?.replace("[Fichier] ", "").trim()
    const url = right?.trim()
    if (name && url) return { kind: "file", name, url }
  }

  return { kind: "text", text: value }
}

export function buildImageAlt(url: string) {
  try {
    const parsed = new URL(url)
    const name = parsed.pathname.split("/").pop()
    if (name) return `Image: ${name}`
  } catch {
    // ignore
  }
  return "Image partagée"
}

