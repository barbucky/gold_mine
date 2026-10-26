import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { modifierSalle, supprimerSalle } from '../db/salles'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { Salle } from '../db/types'

type ManageSallesSheetProps = {
  open: boolean
  onClose: () => void
  onToast: (message: string) => void
}

export function ManageSallesSheet({ open, onClose, onToast }: ManageSallesSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const [renommageId, setRenommageId] = useState<number | null>(null)
  const [renNumero, setRenNumero] = useState('')
  const [renNom, setRenNom] = useState('')

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const objets = useLiveQuery(() => db.objets.toArray())
  const comptesParSalle = new Map<number, number>()
  if (objets) {
    for (const o of objets) comptesParSalle.set(o.salleId, (comptesParSalle.get(o.salleId) ?? 0) + 1)
  }

  async function close() {
    if (!reducedMotion) {
      const anims = [
        overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, easing: 'ease-in', fill: 'forwards' }),
        sheetRef.current?.animate([{ transform: 'none' }, { transform: 'translateY(50px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }),
      ].filter((a): a is Animation => !!a)
      await Promise.all(anims.map((a) => a.finished)).catch(() => {})
    }
    setRenommageId(null)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    if (reducedMotion) return
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' })
    sheetRef.current?.animate([{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], {
      duration: 460,
      easing: 'cubic-bezier(.2,.8,.25,1)',
    })
  }, [open, reducedMotion])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (renommageId != null) {
        setRenommageId(null)
      } else {
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, renommageId])

  function commencerRenommage(salle: Salle) {
    setRenommageId(salle.id!)
    setRenNumero(salle.numero)
    setRenNom(salle.nom)
  }

  async function enregistrerRenommage() {
    if (renommageId == null || !renNumero.trim() || !renNom.trim()) return
    await modifierSalle(renommageId, { numero: renNumero.trim(), nom: renNom.trim() })
    setRenommageId(null)
    onToast('Salle renommée.')
  }

  async function supprimer(salle: Salle) {
    const compte = comptesParSalle.get(salle.id!) ?? 0
    if (compte > 0) {
      onToast(`Vide d’abord cette salle (${compte} objet${compte > 1 ? 's' : ''}) avant de la supprimer.`)
      return
    }
    if (!window.confirm(`Supprimer la salle « ${salle.nom} » ?`)) return
    await supprimerSalle(salle.id!)
    onToast('Salle supprimée.')
  }

  return (
    <div
      className="sheet-overlay"
      ref={overlayRef}
      hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gestionSallesTitre"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-bar">
          <h2 className="d-name" id="gestionSallesTitre" style={{ fontSize: 20 }}>
            Gérer les salles
          </h2>
          <button className="round" type="button" aria-label="Fermer" onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <ul className="salle-manage-list">
          {salles?.map((salle) => (
            <li key={salle.id}>
              <span className="salle-manage-label">
                {salle.numero} · {salle.nom}
                <span className="note"> ({comptesParSalle.get(salle.id!) ?? 0} objets)</span>
              </span>
              <div className="salle-manage-actions">
                <button className="ghost" type="button" onClick={() => commencerRenommage(salle)}>
                  Renommer
                </button>
                <button className="ghost menu-danger" type="button" onClick={() => supprimer(salle)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
          {salles?.length === 0 && <p className="note">Aucune salle pour l&rsquo;instant.</p>}
        </ul>
      </div>

      {renommageId != null && (
        <div
          className="mini-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRenommageId(null)
          }}
        >
          <div className="mini-dialog">
            <h3>Renommer la salle</h3>
            <div className="field">
              <label htmlFor="rnSalleNumero">N° de la salle</label>
              <input id="rnSalleNumero" value={renNumero} onChange={(e) => setRenNumero(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rnSalleNom">Nom de la salle</label>
              <input id="rnSalleNom" autoFocus value={renNom} onChange={(e) => setRenNom(e.target.value)} />
            </div>
            <div className="mini-dialog-actions">
              <button className="ghost" type="button" onClick={() => setRenommageId(null)}>
                Annuler
              </button>
              <button className="primary" type="button" onClick={enregistrerRenommage}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
