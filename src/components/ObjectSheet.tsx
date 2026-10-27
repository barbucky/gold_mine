import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { modifierObjet, supprimerObjet } from '../db/objets'
import { importerPhoto } from '../db/photos'
import { Pedestal } from './Pedestal'
import { FavoriteCoin } from './FavoriteCoin'
import { PiecesJointes } from './PiecesJointes'
import { SalleIcone } from './SalleIcone'
import { useReducedMotion } from '../lib/useReducedMotion'
import { trouverProgression, valeurAchatUnitaire } from '../lib/valeurObjet'
import type { ValeurProgression } from '../db/types'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export type ObjectSheetHandle = {
  open: (objetId: number, opener: HTMLElement | null) => void
}

type ObjectSheetProps = {
  onToast: (message: string) => void
  onEdit: (objetId: number, opener: HTMLElement | null) => void
}

export const ObjectSheet = forwardRef<ObjectSheetHandle, ObjectSheetProps>(function ObjectSheet({ onToast, onEdit }, ref) {
  const [objetId, setObjetId] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [descOuverte, setDescOuverte] = useState(false)
  const [descTronquable, setDescTronquable] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const reducedMotion = useReducedMotion()

  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const objet = useLiveQuery(() => (objetId !== null ? db.objets.get(objetId) : undefined), [objetId])
  const salle = useLiveQuery(() => (objet ? db.salles.get(objet.salleId) : undefined), [objet])
  const champProgression = salle?.champsPersonnalises.find((c) => c.type === 'progression')
  const progression = objet && champProgression ? trouverProgression(objet, salle) : undefined
  const champsTexte = salle?.champsPersonnalises.filter((c) => c.type === 'texte') ?? []

  function open(id: number, opener: HTMLElement | null) {
    // Annule toute animation de fermeture encore « figée » (fill: forwards) d'un cycle précédent,
    // sinon elle reste au-dessus des nouvelles animations d'ouverture une fois celles-ci terminées.
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setDescOuverte(false)
    setMenuOuvert(false)
    setObjetId(id)
    setVisible(true)
  }

  useImperativeHandle(ref, () => ({ open }))

  async function close() {
    if (!visible) return
    setMenuOuvert(false)
    if (!reducedMotion) {
      // Volontairement pas de `.cancel()` ici : voir le commentaire équivalent dans AddEditSheet.tsx.
      const anims = [
        overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, easing: 'ease-in', fill: 'forwards' }),
        sheetRef.current?.animate([{ transform: 'none' }, { transform: 'translateY(50px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }),
      ].filter((a): a is Animation => !!a)
      await Promise.all(anims.map((a) => a.finished)).catch(() => {})
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

  async function toggleSerieComplete(nomChamp: string, valeur: ValeurProgression, complet: boolean) {
    if (!objet) return
    await modifierObjet(objet.id!, { details: { ...objet.details, [nomChamp]: { ...valeur, complet } } })
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !objet) return
    try {
      await importerPhoto(objet.id!, file)
      onToast('Photo placée dans la vitrine.')
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Cette image ne peut pas être utilisée.')
    }
  }

  async function handleModifier() {
    setMenuOuvert(false)
    const id = objet?.id
    const opener = openerRef.current
    await close()
    if (id != null) onEdit(id, opener)
  }

  async function handleSupprimer() {
    setMenuOuvert(false)
    if (!objet?.id) return
    if (!window.confirm(`Supprimer « ${objet.nom} » ? Cette action est irréversible.`)) return
    await supprimerObjet(objet.id)
    onToast('Objet supprimé.')
    close()
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
          <div className="menu-wrap">
            <button
              className="round"
              type="button"
              aria-label="Plus d&rsquo;actions"
              aria-expanded={menuOuvert}
              ref={menuBtnRef}
              onClick={() => setMenuOuvert((v) => !v)}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx={4} cy={10} r={1.8} />
                <circle cx={10} cy={10} r={1.8} />
                <circle cx={16} cy={10} r={1.8} />
              </svg>
            </button>
            {menuOuvert && (
              <div className="menu">
                <button type="button" onClick={handleModifier}>
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOuvert(false)
                    onToast('Déplacer vers une autre salle : à venir dans une prochaine version.')
                  }}
                >
                  Déplacer vers une autre salle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOuvert(false)
                    onToast('Partager : à venir dans une prochaine version.')
                  }}
                >
                  Partager
                </button>
                <button type="button" className="menu-danger" onClick={handleSupprimer}>
                  Supprimer
                </button>
              </div>
            )}
          </div>
          <button className="round" type="button" aria-label="Fermer" ref={closeBtnRef} onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <div className="stage" ref={stageRef}>
          <Pedestal objetId={objetId ?? undefined} iconeSalle={salle?.icone} />
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
              <span className="pill">{euro.format(valeurAchatUnitaire(objet, salle) / 100)}</span>
            </div>

            <p className={`d-desc${descOuverte ? '' : ' clamp'}`} ref={descRef}>
              {objet.description}
            </p>
            {descTronquable && (
              <button className="more" type="button" onClick={() => setDescOuverte((v) => !v)}>
                {descOuverte ? 'Réduire' : 'Lire la suite'}
              </button>
            )}

            <label className="more photo-btn" htmlFor="dPhoto">
              Essayer avec une photo
            </label>
            <input id="dPhoto" className="vh" type="file" accept="image/*" onChange={handlePhotoChange} />
            <p className="photo-tip">
              Conseil : un objet détouré (fond transparent) s&rsquo;intègre le mieux. Sur iPhone, un appui long sur l&rsquo;objet dans Photos
              permet de copier le sujet sans le fond.
            </p>

            <dl className="d-facts">
              <div>
                <dt>Emplacement</dt>
                <dd>
                  {salle && <SalleIcone salle={salle} />} {salle ? `Salle ${salle.numero} · ${salle.nom}` : ''}
                </dd>
              </div>
              {(objet.quantite ?? 1) > 1 && (
                <div>
                  <dt>Exemplaires</dt>
                  <dd>{objet.quantite}</dd>
                </div>
              )}
              {objet.anneeCreation != null && (
                <div>
                  <dt>Année de création</dt>
                  <dd>{objet.anneeCreation}</dd>
                </div>
              )}
              {champProgression && progression && (
                <div>
                  <dt>{champProgression.nom}</dt>
                  <dd>
                    <div className="fact-progression">
                      <span>
                        Tomes {progression.du} à {progression.au}
                      </span>
                      <label className="switch-row compact">
                        <span>Série complète</span>
                        <input
                          type="checkbox"
                          role="switch"
                          checked={progression.complet}
                          onChange={(e) => toggleSerieComplete(champProgression.nom, progression, e.target.checked)}
                        />
                      </label>
                    </div>
                  </dd>
                </div>
              )}
              {objet.reference && (
                <div>
                  <dt>Référence</dt>
                  <dd>{objet.reference}</dd>
                </div>
              )}
              <div>
                <dt>Provenance</dt>
                <dd>{objet.provenance}</dd>
              </div>
              {champsTexte.map((champ) => {
                const valeur = objet.details[champ.nom]
                if (typeof valeur !== 'string' || !valeur) return null
                return (
                  <div key={champ.nom}>
                    <dt>{champ.nom}</dt>
                    <dd>{valeur}</dd>
                  </div>
                )
              })}
              <div>
                <dt>Inventaire</dt>
                <dd className="mono">Inv. {objet.inventaire}</dd>
              </div>
            </dl>

            <PiecesJointes objetId={objet.id!} onToast={onToast} />
          </div>
        )}
      </div>
    </div>
  )
})
