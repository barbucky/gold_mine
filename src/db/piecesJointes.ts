import { db } from './database'

const TAILLE_MAX_OCTETS = 15 * 1024 * 1024

export function listerPiecesJointes(objetId: number) {
  return db.piecesJointes.where('objetId').equals(objetId).toArray()
}

/** Importe une facture/un document pour un objet — photo ou PDF uniquement. */
export async function importerPieceJointe(objetId: number, file: File) {
  const estImage = file.type.startsWith('image/')
  const estPdf = file.type === 'application/pdf'
  if (!estImage && !estPdf) {
    throw new Error('Format non reconnu. Formats acceptés : photo ou PDF.')
  }
  if (file.size > TAILLE_MAX_OCTETS) {
    throw new Error('Fichier trop lourd (15 Mo maximum).')
  }

  return db.piecesJointes.add({
    objetId,
    type: estImage ? 'photo' : 'pdf',
    fichier: file,
    nomFichier: file.name,
    tailleOctets: file.size,
    ajouteLe: new Date(),
  })
}

export function supprimerPieceJointe(id: number) {
  return db.piecesJointes.delete(id)
}
