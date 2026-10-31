import { db } from './database'
import { chargerImage, estHeic, formatAccepte, prepareImage, redimensionner, canvasVersBlob } from '../lib/images'
import type { Photo } from './types'

const TAILLE_ORIGINALE = 2048
const TAILLE_DETOUREE = 1024
const TAILLE_MINIATURE = 300
const QUALITE_JPEG = 0.85

export function obtenirPhotoDeLObjet(objetId: number) {
  return db.photos.where('objetId').equals(objetId).first()
}

export function obtenirPhotoDuSouhait(souhaitId: number) {
  return db.photos.where('souhaitId').equals(souhaitId).first()
}

type PhotoTraitee = Omit<Photo, 'id' | 'objetId' | 'souhaitId'>

/** Décode et redimensionne un fichier image aux trois tailles stockées (originale, détourée, miniature). */
async function traiterPhoto(file: File): Promise<PhotoTraitee> {
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

  return { originale, detouree, miniature, largeur, hauteur, estDetouree }
}

/** Importe une photo pour un objet (remplace la précédente s'il y en a une). */
export async function importerPhoto(objetId: number, file: File) {
  const traitee = await traiterPhoto(file)
  const existante = await obtenirPhotoDeLObjet(objetId)
  if (existante) {
    await db.photos.update(existante.id!, traitee)
  } else {
    await db.photos.add({ objetId, ...traitee })
  }
}

/** Importe une photo pour un souhait (wishlist) — remplace la précédente s'il y en a une. */
export async function importerPhotoSouhait(souhaitId: number, file: File) {
  const traitee = await traiterPhoto(file)
  const existante = await obtenirPhotoDuSouhait(souhaitId)
  if (existante) {
    await db.photos.update(existante.id!, traitee)
  } else {
    await db.photos.add({ souhaitId, ...traitee })
  }
}

export async function supprimerPhotoDuSouhait(souhaitId: number) {
  const existante = await obtenirPhotoDuSouhait(souhaitId)
  if (existante) await db.photos.delete(existante.id!)
}

/** À l'achat d'un souhait : reprend sa photo déjà traitée pour le nouvel objet, sans réimport ni retraitement. */
export async function copierPhotoSouhaitVersObjet(souhaitId: number, objetId: number) {
  const photoSouhait = await obtenirPhotoDuSouhait(souhaitId)
  if (!photoSouhait) return
  const { id: _id, souhaitId: _souhaitId, ...donnees } = photoSouhait
  await db.photos.add({ objetId, ...donnees })
}
