import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { db } from '../db/database'
import { modifierObjet } from '../db/objets'
import { reordonnerSalles } from '../db/salles'
import { chargerJeuDExemple } from '../db/seed'
import { Vitrine } from '../components/Vitrine'
import { FavoriteCoin } from '../components/FavoriteCoin'
import { SalleIcone } from '../components/SalleIcone'
import { DragHandle } from '../components/DragHandle'
import { useReducedMotion } from '../lib/useReducedMotion'
import { OPTIONS_TRI, trierObjets, type TriCle } from '../lib/triObjets'
import { pourcentageProgression, quantiteObjet, trouverProgression, valeurAchat, valeurAchatUnitaire } from '../lib/valeurObjet'
import type { Objet, Salle } from '../db/types'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type CollectionsProps = {
  onOpenObjet: (objetId: number, opener: HTMLElement | null) => void
  onOpenGestionSalles: () => void
}

type StatsSalle = {
  nombre: number
  anneeMin: number | null
  anneeMax: number | null
  dernierAjout: { nom: string; marque: string } | null
  totalPrixAchat: number
}

function calculerStats(objets: Objet[], salle: Salle): StatsSalle {
  const annees = objets.map((o) => o.achatAnnee).filter((a): a is number => typeof a === 'number')
  const dernierAjout = objets.reduce<Objet | null>(
    (plusRecent, o) => (!plusRecent || o.creeLe > plusRecent.creeLe ? o : plusRecent),
    null,
  )
  return {
    nombre: objets.reduce((total, o) => total + quantiteObjet(o), 0),
    anneeMin: annees.length ? Math.min(...annees) : null,
    anneeMax: annees.length ? Math.max(...annees) : null,
    dernierAjout: dernierAjout && { nom: dernierAjout.nom, marque: dernierAjout.marque },
    totalPrixAchat: objets.reduce((total, o) => total + valeurAchat(o, salle), 0),
  }
}

type RoomRowProps = {
  salle: Salle
  stats: StatsSalle | undefined
  onOpen: () => void
}

/** Ligne de salle réordonnable (glisser-déposer) — composant à part pour que `useSortable`
 *  respecte les règles des hooks (un nombre de salles qui varie interdit de l'appeler en boucle). */
function RoomRow({ salle, stats, onOpen }: RoomRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: salle.id! })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }
  const periode =
    stats?.anneeMin != null ? (stats.anneeMin === stats.anneeMax ? `${stats.anneeMin}` : `${stats.anneeMin} – ${stats.anneeMax}`) : null
  const sousTitre = [periode, stats?.dernierAjout && `dernier ajout : ${stats.dernierAjout.nom} · ${stats.dernierAjout.marque}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="room-row" ref={setNodeRef} style={style}>
      <DragHandle attributes={attributes} listeners={listeners} label={`Réordonner la salle ${salle.nom}`} />
      <button className="room" type="button" onClick={onOpen}>
        <span className="numeral">{salle.numero}</span>
        <span>
          <span className="n">
            <SalleIcone salle={salle} taille={16} /> {salle.nom}
          </span>
          <span className="s">{sousTitre}</span>
        </span>
        <span className="count">
          {stats?.nombre ?? 0}
          <small>objets</small>
        </span>
        <span className="chev" aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  )
}

export function Collections({ onOpenObjet, onOpenGestionSalles }: CollectionsProps) {
  const [salleOuverteId, setSalleOuverteId] = useState<number | null>(null)
  const [tri, setTri] = useState<TriCle>('recent')
  const [filtreMarque, setFiltreMarque] = useState<string>('toutes')
  const [filtreAnnee, setFiltreAnnee] = useState<string>('toutes')
  const [filtresChamps, setFiltresChamps] = useState<Record<string, string>>({})
  const reducedMotion = useReducedMotion()
  const estPremierRendu = useRef(true)
  const roomsRef = useRef<HTMLDivElement>(null)
  const roomRef = useRef<HTMLDivElement>(null)

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const objets = useLiveQuery(() => db.objets.toArray())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const statsParSalle = new Map<number, StatsSalle>()
  if (salles && objets) {
    for (const salle of salles) {
      statsParSalle.set(salle.id!, calculerStats(objets.filter((o) => o.salleId === salle.id), salle))
    }
  }

  function handleDragEndSalles(event: DragEndEvent) {
    const { active, over } = event
    if (!salles || !over || active.id === over.id) return
    const oldIndex = salles.findIndex((s) => s.id === active.id)
    const newIndex = salles.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const nouvelOrdre = arrayMove(salles, oldIndex, newIndex).map((s) => s.id!)
    reordonnerSalles(nouvelOrdre)
  }

  useEffect(() => {
    if (estPremierRendu.current) {
      estPremierRendu.current = false
      return
    }
    document.querySelector('.app-main')?.scrollTo(0, 0)
    if (reducedMotion) return

    if (salleOuverteId !== null) {
      roomRef.current?.animate([{ opacity: 0, transform: 'translateX(28px)' }, { opacity: 1, transform: 'none' }], {
        duration: 360,
        easing: 'cubic-bezier(.2,.7,.3,1)',
      })
      roomRef.current?.querySelectorAll('.item').forEach((li, k) => {
        li.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
          duration: 380,
          delay: 80 + k * 70,
          easing: 'ease-out',
          fill: 'backwards',
        })
      })
    } else {
      roomsRef.current?.animate([{ opacity: 0, transform: 'translateX(-28px)' }, { opacity: 1, transform: 'none' }], {
        duration: 320,
        easing: 'cubic-bezier(.2,.7,.3,1)',
      })
    }
  }, [salleOuverteId, reducedMotion])

  function ouvrirSalle(id: number) {
    setFiltreMarque('toutes')
    setFiltreAnnee('toutes')
    setFiltresChamps({})
    setSalleOuverteId(id)
  }

  function fermerSalle() {
    setFiltreMarque('toutes')
    setFiltreAnnee('toutes')
    setFiltresChamps({})
    setSalleOuverteId(null)
  }

  async function toggleFavori(objet: Objet) {
    await modifierObjet(objet.id!, { favori: !objet.favori })
  }

  if (!salles || !objets) {
    return (
      <section className="floor">
        <h1>Mes collections</h1>
      </section>
    )
  }

  if (salles.length === 0) {
    return (
      <section className="floor">
        <h1>Mes collections</h1>
        <p className="note">Aucune salle pour l&rsquo;instant.</p>
        <button className="primary" type="button" onClick={() => chargerJeuDExemple()}>
          Charger un jeu d&rsquo;exemple
        </button>
      </section>
    )
  }

  const salleOuverte = salles.find((s) => s.id === salleOuverteId) ?? null
  const objetsBase = salleOuverte ? objets.filter((o) => o.salleId === salleOuverte.id) : []
  const marquesDeLaSalle = [...new Set(objetsBase.map((o) => o.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'))
  const anneesDeLaSalle = [...new Set(objetsBase.map((o) => o.achatAnnee).filter((a): a is number => typeof a === 'number'))].sort(
    (a, b) => a - b,
  )
  // Filtre par champ personnalisé : uniquement les champs de type Texte (une « Progression »
  // ou une « Association » n'ont pas de valeur discrète simple à proposer dans un menu).
  const champsTexteDeLaSalle = (salleOuverte?.champsPersonnalises ?? []).filter((c) => c.type === 'texte')
  const valeursParChamp = new Map(
    champsTexteDeLaSalle.map((champ) => [
      champ.nom,
      [...new Set(objetsBase.map((o) => o.details[champ.nom]).filter((v): v is string => typeof v === 'string' && v !== ''))].sort(
        (a, b) => a.localeCompare(b, 'fr'),
      ),
    ]),
  )
  const filtresChampsActifs = champsTexteDeLaSalle.filter((champ) => (filtresChamps[champ.nom] ?? 'toutes') !== 'toutes')
  const objetsFiltres = objetsBase
    .filter((o) => filtreMarque === 'toutes' || o.marque === filtreMarque)
    .filter((o) => filtreAnnee === 'toutes' || o.achatAnnee === Number(filtreAnnee))
    .filter((o) => filtresChampsActifs.every((champ) => o.details[champ.nom] === filtresChamps[champ.nom]))
  const objetsDeLaSalle = trierObjets(objetsFiltres, tri)
  // Les indicateurs de la salle ouverte (nombre, total) suivent le filtre actif — pas le
  // précompte global de statsParSalle, qui lui reste utile tel quel pour la liste des salles.
  const statsFiltrees = salleOuverte ? calculerStats(objetsFiltres, salleOuverte) : null
  const filtreActif = filtreMarque !== 'toutes' || filtreAnnee !== 'toutes' || filtresChampsActifs.length > 0

  return (
    <section className="floor">
      {!salleOuverte && (
        <div className="floor" ref={roomsRef}>
          <div className="sec-head">
            <h1>Mes collections</h1>
            <button className="link" type="button" onClick={onOpenGestionSalles}>
              Gérer les salles
            </button>
          </div>
          <DndContext sensors={sensors} onDragEnd={handleDragEndSalles}>
            <SortableContext items={salles.map((s) => s.id!)} strategy={verticalListSortingStrategy}>
              <ul className="rooms">
                {salles.map((salle) => (
                  <RoomRow key={salle.id} salle={salle} stats={statsParSalle.get(salle.id!)} onOpen={() => ouvrirSalle(salle.id!)} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {salleOuverte && (
        <div className="floor" ref={roomRef}>
          <div className="room-head">
            <button className="back" type="button" onClick={fermerSalle}>
              ‹ Mes collections
            </button>
            <div className="eyebrow">Salle {salleOuverte.numero}</div>
            <h1>
              <SalleIcone salle={salleOuverte} taille={28} /> {salleOuverte.nom}
            </h1>
            <p className="room-sub">
              {statsFiltrees?.nombre ?? 0} objet{(statsFiltrees?.nombre ?? 0) > 1 ? 's' : ''} ·{' '}
              {euro.format((statsFiltrees?.totalPrixAchat ?? 0) / 100)}
              {filtreActif && <span className="note"> (filtré)</span>}
            </p>
          </div>
          <div className="field">
            <label htmlFor="triSelect">Trier par</label>
            <select id="triSelect" value={tri} onChange={(e) => setTri(e.target.value as TriCle)}>
              {OPTIONS_TRI.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {(marquesDeLaSalle.length > 1 ||
            anneesDeLaSalle.length > 1 ||
            champsTexteDeLaSalle.some((champ) => (valeursParChamp.get(champ.nom)?.length ?? 0) > 1)) && (
            <div className="row2">
              {marquesDeLaSalle.length > 1 && (
                <div className="field">
                  <label htmlFor="filtreMarque">Filtrer par marque</label>
                  <select id="filtreMarque" value={filtreMarque} onChange={(e) => setFiltreMarque(e.target.value)}>
                    <option value="toutes">Toutes les marques</option>
                    {marquesDeLaSalle.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {anneesDeLaSalle.length > 1 && (
                <div className="field">
                  <label htmlFor="filtreAnnee">Filtrer par année d&rsquo;achat</label>
                  <select id="filtreAnnee" value={filtreAnnee} onChange={(e) => setFiltreAnnee(e.target.value)}>
                    <option value="toutes">Toutes les années</option>
                    {anneesDeLaSalle.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {champsTexteDeLaSalle.map((champ) => {
                const valeurs = valeursParChamp.get(champ.nom) ?? []
                if (valeurs.length <= 1) return null
                return (
                  <div className="field" key={champ.nom}>
                    <label htmlFor={`filtreChamp-${champ.nom}`}>Filtrer par {champ.nom.toLowerCase()}</label>
                    <select
                      id={`filtreChamp-${champ.nom}`}
                      value={filtresChamps[champ.nom] ?? 'toutes'}
                      onChange={(e) => setFiltresChamps((f) => ({ ...f, [champ.nom]: e.target.value }))}
                    >
                      <option value="toutes">Toutes les valeurs</option>
                      {valeurs.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          )}
          <ul className="items">
            {objetsDeLaSalle.map((objet) => {
              const progression = trouverProgression(objet, salleOuverte)
              const pourcent = progression ? pourcentageProgression(progression) : undefined
              return (
                <li className="item" key={objet.id}>
                  <button className="item-open" type="button" onClick={(e) => onOpenObjet(objet.id!, e.currentTarget)}>
                    <span className="vit">
                      <Vitrine objetId={objet.id} iconeSalle={salleOuverte?.icone} complet={progression?.complet} />
                    </span>
                    <span className="info">
                      <span className="it-title">{objet.nom}</span>
                      <span className="it-brand">{objet.marque}</span>
                      {pourcent != null && (
                        <span className="it-jauge">
                          <span className="jauge" aria-hidden="true">
                            <span className="jauge-remplissage" style={{ width: `${pourcent}%` }} />
                          </span>
                          <span className="it-jauge-texte">
                            {progression!.au} / {progression!.total}
                          </span>
                        </span>
                      )}
                      <span className="it-date">{objet.dateAffichee}</span>
                      <span className="it-price">{euro.format(valeurAchatUnitaire(objet, salleOuverte) / 100)}</span>
                    </span>
                  </button>
                  <FavoriteCoin
                    pressed={objet.favori}
                    label={`Favori : ${objet.nom}, ${objet.marque}`}
                    onToggle={() => toggleFavori(objet)}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
