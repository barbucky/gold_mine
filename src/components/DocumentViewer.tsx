import { useEffect, useRef } from 'react'
import { useObjectUrl } from '../lib/useObjectUrl'
import { ouvrirPieceAilleurs } from '../lib/ouvrirPieceJointe'
import type { PieceJointe } from '../db/types'

type DocumentViewerProps = {
  piece: PieceJointe | null
  onClose: () => void
}

/** Visualiseur plein écran d'une photo de document (facture, garantie…) — les PDF s'ouvrent
 *  directement via le partage natif, le rendu PDF intégré en iframe n'étant pas fiable sur iOS. */
export function DocumentViewer({ piece, onClose }: DocumentViewerProps) {
  const url = useObjectUrl(piece?.fichier)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!piece) return
    closeBtnRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [piece, onClose])

  return (
    <div
      className="viewer-overlay"
      hidden={!piece}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {piece && url && (
        <div className="viewer">
          <div className="viewer-bar">
            <span className="viewer-nom">{piece.nomFichier}</span>
            <button className="round" type="button" aria-label="Fermer" ref={closeBtnRef} onClick={onClose}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>
          <div className="viewer-body">
            <img src={url} alt={piece.nomFichier} className="viewer-img" />
          </div>
          <button className="ghost viewer-ouvrir" type="button" onClick={() => ouvrirPieceAilleurs(piece)}>
            Ouvrir dans une autre app
          </button>
        </div>
      )}
    </div>
  )
}
