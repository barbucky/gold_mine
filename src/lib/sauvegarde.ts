// Export / import de sauvegarde (specs.md § 7) : un .zip contenant les données (JSON), les photos et les documents.
import { zipSync, unzipSync, type Zippable } from 'fflate'
import { db } from '../db/database'
import type { Salle, Objet, PieceJointe, Reglage, Souhait } from '../db/types'

const VERSION_SAUVEGARDE = 4
const CLE_DERNIERE_SAUVEGARDE = 'derniereSauvegarde'

type SalleJSON = Omit<Salle, 'creeLe' | 'icone'> & { creeLe: string }
type ObjetJSON = Omit<Objet, 'creeLe' | 'modifieLe'> & { creeLe: string; modifieLe: string }
type SouhaitJSON = Omit<Souhait, 'creeLe'> & { creeLe: string }
type PhotoMetaJSON = { id: number; objetId?: number; souhaitId?: number; largeur: number; hauteur: number; estDetouree: boolean }
type PieceMetaJSON = {
  id: number
  objetId: number
  type: 'photo' | 'pdf'
  nomFichier: string
  tailleOctets: number
  mimeType: string
  ajouteLe: string
}

type DonneesJSON = {
  version: number
  exporteLe: string
  salles: SalleJSON[]
  objets: ObjetJSON[]
  photos: PhotoMetaJSON[]
  pieces?: PieceMetaJSON[]
  souhaits?: SouhaitJSON[]
  reglages: Reglage[]
}

export async function obtenirDerniereSauvegarde(): Promise<Date | null> {
  const reglage = await db.reglages.get(CLE_DERNIERE_SAUVEGARDE)
  const valeur = reglage?.valeur
  return typeof valeur === 'string' ? new Date(valeur) : null
}

/** Génère le .zip et déclenche son téléchargement. */
export async function exporterSauvegarde(): Promise<void> {
  const [salles, objets, photos, pieces, souhaits, reglages] = await Promise.all([
    db.salles.toArray(),
    db.objets.toArray(),
    db.photos.toArray(),
    db.piecesJointes.toArray(),
    db.souhaits.toArray(),
    db.reglages.toArray(),
  ])

  const exporteLe = new Date().toISOString()
  const donnees: DonneesJSON = {
    version: VERSION_SAUVEGARDE,
    exporteLe,
    salles: salles.map((s) => {
      const { icone: _icone, ...reste } = s
      return { ...reste, creeLe: s.creeLe.toISOString() }
    }),
    objets: objets.map((o) => ({ ...o, creeLe: o.creeLe.toISOString(), modifieLe: o.modifieLe.toISOString() })),
    photos: photos.map((p) => ({
      id: p.id!,
      objetId: p.objetId,
      souhaitId: p.souhaitId,
      largeur: p.largeur,
      hauteur: p.hauteur,
      estDetouree: p.estDetouree,
    })),
    pieces: pieces.map((p) => ({
      id: p.id!,
      objetId: p.objetId,
      type: p.type,
      nomFichier: p.nomFichier,
      tailleOctets: p.tailleOctets,
      mimeType: p.fichier.type,
      ajouteLe: p.ajouteLe.toISOString(),
    })),
    souhaits: souhaits.map((s) => ({ ...s, creeLe: s.creeLe.toISOString() })),
    reglages: reglages.filter((r) => r.cle !== CLE_DERNIERE_SAUVEGARDE),
  }

  const fichiers: Zippable = {
    'donnees.json': new TextEncoder().encode(JSON.stringify(donnees)),
  }

  for (const photo of photos) {
    const dossier = `photos/${photo.id}`
    // L'extension suit l'encodage réel (PNG pour une photo détourée — transparence — sinon JPEG).
    const ext = photo.estDetouree ? 'png' : 'jpg'
    fichiers[`${dossier}/originale.${ext}`] = new Uint8Array(await photo.originale.arrayBuffer())
    fichiers[`${dossier}/miniature.${ext}`] = new Uint8Array(await photo.miniature.arrayBuffer())
    if (photo.detouree) {
      fichiers[`${dossier}/detouree.png`] = new Uint8Array(await photo.detouree.arrayBuffer())
    }
  }

  for (const salle of salles) {
    if (salle.icone) {
      fichiers[`salles/${salle.id}/icone.png`] = new Uint8Array(await salle.icone.arrayBuffer())
    }
  }

  for (const piece of pieces) {
    fichiers[`documents/${piece.id}/${piece.nomFichier}`] = new Uint8Array(await piece.fichier.arrayBuffer())
  }

  const zipOctets = zipSync(fichiers, { level: 6 })
  const blob = new Blob([zipOctets], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = `mcs-gold-mine-sauvegarde-${exporteLe.slice(0, 10)}.zip`
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)

  await db.reglages.put({ cle: CLE_DERNIERE_SAUVEGARDE, valeur: exporteLe })
}

/** Cherche un fichier de photo quelle que soit son extension (.png ou .jpg) — les sauvegardes
 *  antérieures à cette version écrivaient toujours « .jpg », même pour une photo détourée (PNG). */
function trouverFichierPhoto(
  contenu: Record<string, Uint8Array>,
  dossier: string,
  base: string,
): { octets: Uint8Array; mime: string } | null {
  const png = contenu[`${dossier}/${base}.png`]
  if (png) return { octets: png, mime: 'image/png' }
  const jpg = contenu[`${dossier}/${base}.jpg`]
  if (jpg) return { octets: jpg, mime: 'image/jpeg' }
  return null
}

/** Remplace entièrement les données actuelles par le contenu du .zip. */
export async function importerSauvegarde(fichier: File): Promise<void> {
  const octets = new Uint8Array(await fichier.arrayBuffer())
  let contenu: Record<string, Uint8Array>
  try {
    contenu = unzipSync(octets)
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde valide.')
  }

  const donneesRaw = contenu['donnees.json']
  if (!donneesRaw) throw new Error('Fichier de sauvegarde invalide (donnees.json manquant).')

  let donnees: DonneesJSON
  try {
    donnees = JSON.parse(new TextDecoder().decode(donneesRaw))
  } catch {
    throw new Error('Fichier de sauvegarde illisible.')
  }
  if (donnees.version < 1 || donnees.version > VERSION_SAUVEGARDE) {
    throw new Error('Version de sauvegarde non reconnue.')
  }

  await db.transaction('rw', [db.salles, db.objets, db.photos, db.piecesJointes, db.souhaits, db.reglages], async () => {
    await Promise.all([
      db.salles.clear(),
      db.objets.clear(),
      db.photos.clear(),
      db.piecesJointes.clear(),
      db.souhaits.clear(),
      db.reglages.clear(),
    ])

    await db.salles.bulkAdd(donnees.salles.map((s) => ({ ...s, creeLe: new Date(s.creeLe) })))
    await db.objets.bulkAdd(donnees.objets.map((o) => ({ ...o, creeLe: new Date(o.creeLe), modifieLe: new Date(o.modifieLe) })))
    if (donnees.souhaits?.length) {
      await db.souhaits.bulkAdd(donnees.souhaits.map((s) => ({ ...s, creeLe: new Date(s.creeLe) })))
    }
    if (donnees.reglages.length) await db.reglages.bulkAdd(donnees.reglages)

    for (const salle of donnees.salles) {
      const iconeOctets = contenu[`salles/${salle.id}/icone.png`]
      if (iconeOctets) {
        await db.salles.update(salle.id!, { icone: new Blob([iconeOctets as BlobPart], { type: 'image/png' }) })
      }
    }

    for (const meta of donnees.photos) {
      const dossier = `photos/${meta.id}`
      const originale = trouverFichierPhoto(contenu, dossier, 'originale')
      const miniature = trouverFichierPhoto(contenu, dossier, 'miniature')
      const detoureeOctets = contenu[`${dossier}/detouree.png`]
      if (!originale || !miniature) continue
      await db.photos.add({
        id: meta.id,
        objetId: meta.objetId,
        souhaitId: meta.souhaitId,
        largeur: meta.largeur,
        hauteur: meta.hauteur,
        estDetouree: meta.estDetouree,
        originale: new Blob([originale.octets as BlobPart], { type: originale.mime }),
        miniature: new Blob([miniature.octets as BlobPart], { type: miniature.mime }),
        detouree: detoureeOctets ? new Blob([detoureeOctets as BlobPart], { type: 'image/png' }) : null,
      })
    }

    for (const meta of donnees.pieces ?? []) {
      const octetsFichier = contenu[`documents/${meta.id}/${meta.nomFichier}`]
      if (!octetsFichier) continue
      const piece: PieceJointe = {
        id: meta.id,
        objetId: meta.objetId,
        type: meta.type,
        nomFichier: meta.nomFichier,
        tailleOctets: meta.tailleOctets,
        ajouteLe: new Date(meta.ajouteLe),
        fichier: new Blob([octetsFichier as BlobPart], { type: meta.mimeType }),
      }
      await db.piecesJointes.add(piece)
    }
  })
}
