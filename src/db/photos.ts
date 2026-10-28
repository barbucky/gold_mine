import { db } from './database'
import { chargerImage, estHeic, formatAccepte, prepareImage, redimensionner, canvasVersBlob } from '../lib/images'

const TAILLE_ORIGINALE = 2048
const TAILLE_DETOUREE = 1024
const TAILLE_MINIATURE = 300
const QUALITE_JPEG = 0.85

export function obtenirPhotoDeLObjet(objetId: number) {
  return db.photos.where('objetId').equals(objetId).first()
}

/** Importe une photo pour un objet (remplace la précédente s'il y en a une). */
export async function importerPhoto(objetId: number, file: File) {
  if (estHeic(file)) {
    throw new Error('Les photos HEIC ne sont pas lisibles partout. Choisis plutôt un JPEG, PNG ou WebP.')
  }
  if (!formatAccepte(file)) {
    throw new Error('Format non reconnu. Formats acceptés : JPEG, PNG, WebP.')
  }

  const image = await chargerImage(file)

  const { canvas: canvasDetouree, detouree: estDetouree } = prepareImage(image, TAILLE_DETOUREE)
  const detouree = estDetouree ? await canvasVersBlob(canvasDetouree, 'image/png') : null

  // Une photo détourée doit rester en PNG (transparence) à toutes les tailles, pas seulement
  // pour `detouree` — sinon la miniature (vignettes des listes) perd son fond transparent et
  // s'affiche avec un fond noir (JPEG n'a pas de canal alpha).
  const format = estDetouree ? 'image/png' : 'image/jpeg'
  const qualite = estDetouree ? undefined : QUALITE_JPEG
  const { blob: originale, largeur, hauteur } = await redimensionner(image, TAILLE_ORIGINALE, format, qualite)
  const { blob: miniature } = await redimensionner(image, TAILLE_MINIATURE, format, qualite)

  const existante = await obtenirPhotoDeLObjet(objetId)
  const donnees = { objetId, originale, detouree, miniature, largeur, hauteur, estDetouree }

  if (existante) {
    await db.photos.update(existante.id!, donnees)
  } else {
    await db.photos.add(donnees)
  }
}
