/**
 * @author @hopsyder
 * @description Calcul des dimensions de compression (le rendu canvas n'existe pas sous jsdom).
 */
import { compressImage, fitWithin } from "@/lib/compress-image"

describe("fitWithin", () => {
  it("réduit le plus grand côté en gardant le ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 })
  })
  it("n'agrandit jamais une petite image", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })
})

describe("compressImage", () => {
  it("laisse intacts les fichiers non image, les GIF et les petits fichiers", async () => {
    const pdf = new File(["x"], "doc.pdf", { type: "application/pdf" })
    const gif = new File([new Uint8Array(500_000)], "a.gif", { type: "image/gif" })
    const small = new File([new Uint8Array(10_000)], "p.jpg", { type: "image/jpeg" })
    expect(await compressImage(pdf)).toBe(pdf)
    expect(await compressImage(gif)).toBe(gif)
    expect(await compressImage(small)).toBe(small)
  })
})
