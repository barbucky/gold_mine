import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { importerIconeSalle, modifierSalle, supprimerIconeSalle, supprimerSalle } from '../db/salles'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useObjectUrl } from '../lib/useObjectUrl'
import { SalleIcone } from './SalleIcone'
import type { ChampPersonnalise, Salle, TypeChamp } from '../db/types'

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
  const [renIconeFile, setRenIconeFile] = useState<File | null>(null)
  const [champsSalleId, setChampsSalleId] = useState<number | null>(null)
  const [nouveauChampNom, setNouveauChampNom] = useState('')
  const [nouveauChampType, setNouveauChampType] = useState<TypeChamp>('texte')

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const objets = useLiveQuery(() => db.objets.toArray())
  const comptesParSalle = new Map<number, number>()
  if (objets) {
    for (const o of objets) comptesParSalle.set(o.salleId, (comptesParSalle.get(o.salleId) ?? 0) + 1)
  }
  const salleChamps = salles?.find((s) => s.id === champsSalleId)
  const salleRenommage = salles?.find((s) => s.id === renommageId)
  const renIconeApercu = useObjectUrl(renIconeFile ?? undefined)

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
      } else if (champsSalleId != null) {
        setChampsSalleId(null)
      } else {
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, renommageId, champsSalleId])

  function commencerRenommage(salle: Salle) {
    setRenommageId(salle.id!)
    setRenNumero(salle.numero)
    setRenNom(salle.nom)
    setRenIconeFile(null)
  }

  async function enregistrerRenommage() {
    if (renommageId == null || !renNumero.trim() || !renNom.trim()) return
    await modifierSalle(renommageId, { numero: renNumero.trim(), nom: renNom.trim() })
    if (renIconeFile) {
      try {
        await importerIconeSalle(renommageId, renIconeFile)
      } catch (err) {
        onToast(err instanceof Error ? err.message : 'Impossible d’importer cette icône.')
      }
    }
    setRenommageId(null)
    onToast('Salle renommée.')
  }

  async function retirerIcone() {
    if (renommageId == null) return
    await supprimerIconeSalle(renommageId)
    setRenIconeFile(null)
  }

  function ouvrirChamps(salle: Salle) {
    setChampsSalleId(salle.id!)
    setNouveauChampNom('')
    setNouveauChampType('texte')
  }

  async function ajouterChamp() {
    const salle = salles?.find((s) => s.id === champsSalleId)
    const nom = nouveauChampNom.trim()
    if (!salle || !nom) return
    if (salle.champsPersonnalises.some((c) => c.nom === nom)) {
      onToast('Un champ de ce nom existe déjà pour cette salle.')
      return
    }
    const champsPersonnalises: ChampPersonnalise[] = [...salle.champsPersonnalises, { nom, type: nouveauChampType }]
    await modifierSalle(salle.id!, { champsPersonnalises })
    setNouveauChampNom('')
  }

  async function supprimerChamp(salle: Salle, nom: string) {
    const champsPersonnalises = salle.champsPersonnalises.filter((c) => c.nom !== nom)
    await modifierSalle(salle.id!, { champsPersonnalises })
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
                <SalleIcone salle={salle} />
                {salle.numero} · {salle.nom}
                <span className="note"> ({comptesParSalle.get(salle.id!) ?? 0} objets)</span>
              </span>
              <div className="salle-manage-actions">
                <button className="ghost" type="button" onClick={() => commencerRenommage(salle)}>
                  Renommer
                </button>
                <button className="ghost" type="button" onClick={() => ouvrirChamps(salle)}>
                  Champs
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
            <div className="field">
              <label htmlFor="rnSalleIcone">Icône (optionnel)</label>
              <div className="icone-champ">
                {renIconeApercu ? (
                  <img className="icone-apercu" src={renIconeApercu} alt="" />
                ) : (
                  salleRenommage && <SalleIcone salle={salleRenommage} taille={48} />
                )}
                <input
                  id="rnSalleIcone"
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  onChange={(e) => setRenIconeFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {salleRenommage?.icone && !renIconeFile && (
                <button className="link" type="button" onClick={retirerIcone}>
                  Retirer l&rsquo;icône
                </button>
              )}
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

      {salleChamps && (
        <div
          className="mini-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setChampsSalleId(null)
          }}
        >
          <div className="mini-dialog">
            <h3>Champs personnalisés — {salleChamps.nom}</h3>
            {salleChamps.champsPersonnalises.length > 0 && (
              <ul className="champ-manage-list">
                {salleChamps.champsPersonnalises.map((champ) => (
                  <li key={champ.nom}>
                    <span>
                      {champ.nom}{' '}
                      <span className="note">
                        ({champ.type === 'progression' ? 'progression' : champ.type === 'association' ? 'associations' : 'texte'})
                      </span>
                    </span>
                    <button className="ghost menu-danger" type="button" onClick={() => supprimerChamp(salleChamps, champ.nom)}>
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="row2">
              <div className="field">
                <label htmlFor="champNom">Nom du champ</label>
                <input id="champNom" placeholder="Volumes possédés" value={nouveauChampNom} onChange={(e) => setNouveauChampNom(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="champType">Type</label>
                <select id="champType" value={nouveauChampType} onChange={(e) => setNouveauChampType(e.target.value as TypeChamp)}>
                  <option value="texte">Texte</option>
                  <option value="progression">Progression</option>
                  <option value="association">Associations</option>
                </select>
              </div>
            </div>
            {nouveauChampType === 'progression' && (
              <p className="note">Pour une série (ex. mangas) : actuel/total de volumes, utilisé aussi pour calculer la valeur totale.</p>
            )}
            {nouveauChampType === 'association' && (
              <p className="note">Pour lier cet objet à un autre de la collection (ex. un jeu → sa console) : à la création de l&rsquo;objet, tu choisiras une collection puis un objet dedans.</p>
            )}
            <div className="mini-dialog-actions">
              <button className="ghost" type="button" onClick={() => setChampsSalleId(null)}>
                Fermer
              </button>
              <button className="primary" type="button" onClick={ajouterChamp}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
