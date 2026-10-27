import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { importerPieceJointe, listerPiecesJointes, supprimerPieceJointe } from '../db/piecesJointes'
import { ouvrirPieceAilleurs } from '../lib/ouvrirPieceJointe'
import { DocumentViewer } from './DocumentViewer'
import type { PieceJointe } from '../db/types'

type PiecesJointesProps = {
  objetId: number
  onToast: (message: string) => void
}

const dateCourte = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export function PiecesJointes({ objetId, onToast }: PiecesJointesProps) {
  const pieces = useLiveQuery(() => listerPiecesJointes(objetId), [objetId])
  const [pieceOuverte, setPieceOuverte] = useState<PieceJointe | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importerPieceJointe(objetId, file)
      onToast('Document ajouté.')
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Impossible d’ajouter ce document.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleOuvrir(piece: PieceJointe) {
    if (piece.type === 'pdf') {
      ouvrirPieceAilleurs(piece)
    } else {
      setPieceOuverte(piece)
    }
  }

  async function handleSupprimer(piece: PieceJointe, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Retirer « ${piece.nomFichier} » ?`)) return
    await supprimerPieceJointe(piece.id!)
    onToast('Document retiré.')
  }

  return (
    <div className="home-sec">
      <div className="sec-head">
        <h2>Documents</h2>
        <label className="link piece-ajouter">
          Ajouter
          <input ref={inputRef} className="vh" type="file" accept="image/*,application/pdf" onChange={handleImport} />
        </label>
      </div>

      {pieces && pieces.length > 0 ? (
        <ul className="piece-list">
          {pieces.map((piece) => (
            <li key={piece.id}>
              <button className="piece-open" type="button" onClick={() => handleOuvrir(piece)}>
                <span className="piece-icone" aria-hidden="true">
                  {piece.type === 'pdf' ? 'PDF' : 'Photo'}
                </span>
                <span className="piece-info">
                  <span className="piece-nom">{piece.nomFichier}</span>
                  <span className="note">{dateCourte.format(piece.ajouteLe)}</span>
                </span>
              </button>
              <button className="ghost menu-danger" type="button" onClick={(e) => handleSupprimer(piece, e)}>
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="note">Aucun document pour l&rsquo;instant (facture, garantie…).</p>
      )}

      <DocumentViewer piece={pieceOuverte} onClose={() => setPieceOuverte(null)} />
    </div>
  )
}
