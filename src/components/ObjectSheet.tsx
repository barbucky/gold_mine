import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { modifierObjet } from '../db/objets'
import { Pedestal } from './Pedestal'
import { FavoriteCoin } from './FavoriteCoin'
import { useReducedMotion } from '../lib/useReducedMotion'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export type ObjectSheetHandle = {
  open: (objetId: number, opener: HTMLElement | null) => void
}

type ObjectSheetProps = {
  onToast: (message: string) => void
}

export const ObjectSheet = forwardRef<ObjectSheetHandle, ObjectSheetProps>(function ObjectSheet({ onToast }, ref) {
  const [objetId, setObjetId] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [descOuverte, setDescOuverte] = useState(false)
  const [descTronquable, setDescTronquable] = useState(false)
  const reducedMotion = useReducedMotion()

  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const objet = useLiveQuery(() => (objetId !== null ? db.objets.get(objetId) : undefined), [objetId])
  const salle = useLiveQuery(() => (objet ? db.salles.get(objet.salleId) : undefined), [objet])

  function open(id: number, opener: HTMLElement | null) {
    // Annule toute animation de fermeture encore « figée » (fill: forwards) d'un cycle précédent,
    // sinon elle reste au-dessus des nouvelles animations d'ouverture une fois celles-ci terminées.
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setDescOuverte(false)
    setObjetId(id)
    setVisible(true)
  }

  useImperativeHandle(ref, () => ({ open }))

  async function close() {
    if (!visible) return
    if (!reducedMotion) {
      const anims = [
        overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, easing: 'ease-in', fill: 'forwards' }),
        sheetRef.current?.animate([{ transform: 'none' }, { transform: 'translateY(50px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }),
      ].filter((a): a is Animation => !!a)
      await Promise.all(anims.map((a) => a.finished)).catch(() => {})
      anims.forEach((a) => a.cancel())
    }
    setVisible(false)
    setObjetId(null)
    openerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!visible || objetId === null) return
    closeBtnRef.current?.focus({ preventScroll: true })
    if (reducedMotion) return

    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' })
    sheetRef.current?.animate(
      [{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 460, easing: 'cubic-bezier(.2,.8,.25,1)' },
    )
    stageRef.current?.animate(
      [{ transform: 'translateY(24px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 620, delay: 90, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'backwards' },
    )
    bodyRef.current?.animate(
      [{ transform: 'translateY(14px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 420, delay: 200, easing: 'ease-out', fill: 'backwards' },
    )
    const sheen = stageRef.current?.querySelector('.sheen')
    sheen?.animate([{ transform: 'translateX(-120px)' }, { transform: 'translateX(200px)' }], {
      duration: 1100,
      delay: 500,
      easing: 'ease-in-out',
      fill: 'both',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objetId, visible])

  useEffect(() => {
    if (!visible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  useEffect(() => {
    if (!descRef.current) return
    setDescTronquable(descRef.current.scrollHeight > descRef.current.clientHeight + 2)
  }, [objetId, objet?.description, descOuverte])

  async function toggleFavori() {
    if (!objet) return
    await modifierObjet(objet.id!, { favori: !objet.favori })
  }

  return (
    <div
      className="sheet-overlay"
      ref={overlayRef}
      hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ficheNom"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-bar">
          <button
            className="round"
            type="button"
            aria-label="Plus d&rsquo;actions"
            onClick={() => onToast('Modifier, déplacer ou partager l’objet : à venir dans la vraie app.')}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx={4} cy={10} r={1.8} />
              <circle cx={10} cy={10} r={1.8} />
              <circle cx={16} cy={10} r={1.8} />
            </svg>
          </button>
          <button className="round" type="button" aria-label="Fermer" ref={closeBtnRef} onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <div className="stage" ref={stageRef}>
          <Pedestal />
        </div>

        {objet && (
          <div className="d-body" ref={bodyRef}>
            <div className="d-head">
              <div>
                <h2 className="d-name" id="ficheNom">
                  {objet.nom}
                </h2>
                <div className="d-brand">{objet.marque}</div>
              </div>
              <FavoriteCoin pressed={objet.favori} label={`Favori : ${objet.nom}, ${objet.marque}`} onToggle={toggleFavori} />
            </div>

            <div className="d-meta">
              <span className="it-date">{objet.dateAffichee}</span>
              <span className="pill">{euro.format((objet.prixRevente ?? objet.prixAchat) / 100)}</span>
              <span className="d-est">valeur estimée</span>
            </div>

            <p className={`d-desc${descOuverte ? '' : ' clamp'}`} ref={descRef}>
              {objet.description}
            </p>
            {descTronquable && (
              <button className="more" type="button" onClick={() => setDescOuverte((v) => !v)}>
                {descOuverte ? 'Réduire' : 'Lire la suite'}
              </button>
            )}

            <dl className="d-facts">
              <div>
                <dt>Emplacement</dt>
                <dd>
                  {salle ? `Salle ${salle.numero} · ${salle.nom}` : ''}
                </dd>
              </div>
              <div>
                <dt>Inventaire</dt>
                <dd className="mono">Inv. {objet.inventaire}</dd>
              </div>
              <div>
                <dt>Provenance</dt>
                <dd>{objet.provenance}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
})
