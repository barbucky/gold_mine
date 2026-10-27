// Traitement des photos à l'import (specs.md § 6).
// `prepareImage` est repris de la maquette (docs/maquettes/ma-galerie.html), autorisé tel quel par CLAUDE.md.

const FORMATS_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp']
const FORMATS_ICONE_ACCEPTES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
const EXTENSIONS_HEIC = ['.heic', '.heif']

export function formatAccepte(file: File): boolean {
  return FORMATS_ACCEPTES.includes(file.type.toLowerCase())
}

export function formatIconeAccepte(file: File): boolean {
  return FORMATS_ICONE_ACCEPTES.includes(file.type.toLowerCase())
}

export function estHeic(file: File): boolean {
  const type = file.type.toLowerCase()
  if (type === 'image/heic' || type === 'image/heif') return true
  const nom = file.name.toLowerCase()
  return EXTENSIONS_HEIC.some((ext) => nom.endsWith(ext))
}

export function chargerImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible.'))
    }
    image.src = url
  })
}

function canvasVersBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Échec de l’encodage de l’image.'))), type, quality)
  })
}

/** Redimensionne une image (sans recadrage) et l'encode. */
export async function redimensionner(
  image: HTMLImageElement,
  maxSide: number,
  type: string,
  quality?: number,
): Promise<{ blob: Blob; largeur: number; hauteur: number }> {
  const sc = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
  const largeur = Math.max(1, Math.round(image.naturalWidth * sc))
  const hauteur = Math.max(1, Math.round(image.naturalHeight * sc))
  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  canvas.getContext('2d')!.drawImage(image, 0, 0, largeur, hauteur)
  const blob = await canvasVersBlob(canvas, type, quality)
  return { blob, largeur, hauteur }
}

type ImagePreparee = { canvas: HTMLCanvasElement; detouree: boolean }

/**
 * Recadre l'image sur son contenu non transparent (photo déjà détourée) ; sinon
 * ajoute une marge claire (tirage posé). Détection : coins transparents.
 */
export function prepareImage(image: HTMLImageElement, maxSide = 1024): ImagePreparee {
  const nw = image.naturalWidth || 480
  const nh = image.naturalHeight || 560
  const sc = Math.min(1, maxSide / Math.max(nw, nh))
  const w = Math.max(1, Math.round(nw * sc))
  const h = Math.max(1, Math.round(nh * sc))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.drawImage(image, 0, 0, w, h)

  let d: Uint8ClampedArray
  try {
    d = g.getImageData(0, 0, w, h).data
  } catch {
    return { canvas: c, detouree: true }
  }
  const alpha = (x: number, y: number) => d[(y * w + x) * 4 + 3]
  const detouree = alpha(0, 0) < 16 && alpha(w - 1, 0) < 16 && alpha(0, h - 1) < 16 && alpha(w - 1, h - 1) < 16

  if (!detouree) {
    const m = Math.round(Math.max(w, h) * 0.045)
    const out = document.createElement('canvas')
    out.width = w + 2 * m
    out.height = h + 2 * m
    const o = out.getContext('2d')!
    o.fillStyle = '#f6f3ec'
    o.fillRect(0, 0, out.width, out.height)
    o.drawImage(c, m, m)
    return { canvas: out, detouree }
  }

  let x0 = w
  let y0 = h
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha(x, y) > 16) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) return { canvas: c, detouree }
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1
  out.height = y1 - y0 + 1
  out.getContext('2d')!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return { canvas: out, detouree }
}

/** Redimensionne une image dans un cadre carré (sans recadrage, fond transparent) — pour les icônes. */
export async function redimensionnerCarre(image: HTMLImageElement, taille: number): Promise<Blob> {
  const nw = image.naturalWidth || taille
  const nh = image.naturalHeight || taille
  const sc = Math.min(taille / nw, taille / nh)
  const w = Math.round(nw * sc)
  const h = Math.round(nh * sc)
  const canvas = document.createElement('canvas')
  canvas.width = taille
  canvas.height = taille
  canvas.getContext('2d')!.drawImage(image, (taille - w) / 2, (taille - h) / 2, w, h)
  return canvasVersBlob(canvas, 'image/png')
}

export { canvasVersBlob }
