import type { PieceJointe } from '../db/types'

/** Ouvre un document via le partage natif (Fichiers, Photos, visionneuse PDF…), avec repli sur
 *  une ouverture directe de l'URL si le partage n'est pas disponible. */
export async function ouvrirPieceAilleurs(piece: PieceJointe): Promise<void> {
  const file = new File([piece.fichier], piece.nomFichier, { type: piece.fichier.type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch {
      // Partage annulé ou échoué : on retombe sur l'ouverture directe.
    }
  }
  const url = URL.createObjectURL(piece.fichier)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
