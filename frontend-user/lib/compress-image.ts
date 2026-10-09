/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Compression des photos DANS le téléphone, avant l'envoi.
 *              Le plan gratuit Supabase n'offre pas la transformation d'images
 *              à l'affichage : une photo de 4 Mo restait de 4 Mo pour chaque
 *              visiteur. On la réduit donc une fois pour toutes à l'envoi
 *              (≈ 1600 px, JPEG 0,8 → quelques centaines de Ko), ce qui accélère
 *              l'envoi en 3G, l'affichage et réduit le stockage.
 *
 *              Sortie JPEG (et non WebP) : accepté par tous les buckets et
 *              encodable par tous les navigateurs (Safari < 16 n'encode pas le
 *              WebP). Les GIF (animés) et les petits fichiers sont laissés tels
 *              quels ; en cas d'échec, le fichier d'origine est renvoyé.
 * @created 2026-10-09
 */

export interface CompressOptions {
  /** Plus grand côté, en pixels. */
  maxSize?: number
  /** Qualité JPEG (0-1). */
  quality?: number
  /** En dessous de ce poids (octets), on ne touche pas au fichier. */
  skipBelowBytes?: number
}

/** Dimensions cibles en conservant le ratio ; jamais d'agrandissement. */
export function fitWithin(width: number, height: number, maxSize: number): { width: number; height: number } {
  const scale = Math.min(1, maxSize / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxSize = 1600, quality = 0.8, skipBelowBytes = 300 * 1024 } = options

  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file
  if (file.size <= skipBelowBytes) return file
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file

  try {
    // imageOrientation : applique la rotation EXIF des photos de téléphone.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSize)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    // Fond blanc : le JPEG n'a pas de transparence (PNG détourés).
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    // Garder l'original si la compression n'apporte rien.
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() })
  } catch {
    return file
  }
}
