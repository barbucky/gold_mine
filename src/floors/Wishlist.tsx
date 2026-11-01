import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { db } from '../db/database'
import { reordonnerSouhaits } from '../db/souhaits'
import { Vitrine } from '../components/Vitrine'
import { SalleIcone } from '../components/SalleIcone'
import { DragHandle } from '../components/DragHandle'
import type { Salle, Souhait } from '../db/types'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type WishlistProps = {
  onOpenSouhait: (souhaitId: number, opener: HTMLElement | null) => void
  onAchete: (souhaitId: number, opener: HTMLElement | null) => void
}

type WishRowProps = {
  souhait: Souhait
  salle: Salle | undefined
  reordonnable: boolean
  onOpen: (opener: HTMLElement) => void
  onAchete: (opener: HTMLElement) => void
}

/** Ligne de souhait réordonnable (priorité) — composant à part pour que `useSortable`
 *  respecte les règles des hooks (un nombre de souhaits qui varie interdit de l'appeler en boucle). */
function WishRow({ souhait, salle, reordonnable, onOpen, onAchete }: WishRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: souhait.id!,
    disabled: !reordonnable,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }

  return (
    <li className="item item--wishlist" ref={setNodeRef} style={style}>
      <DragHandle attributes={attributes} listeners={listeners} label={`Réordonner « ${souhait.nom} »`} disabled={!reordonnable} />
      <div className="item-wishlist-body">
        <button className="item-open" type="button" onClick={(e) => onOpen(e.currentTarget)}>
          <span className="vit">
            <Vitrine souhaitId={souhait.id} iconeSalle={salle?.icone} />
          </span>
          <span className="info">
            <span className="it-title">{souhait.nom}</span>
            <span className="it-brand">{souhait.marque}</span>
            {salle && (
              <span className="chip">
                <SalleIcone salle={salle} taille={14} />
                {salle.nom}
              </span>
            )}
            <span className="it-price">{euro.format(souhait.prixAchat / 100)}</span>
          </span>
        </button>
        {souhait.visualisation && (
          <a className="link wish-link" href={souhait.visualisation} target="_blank" rel="noopener noreferrer">
            Voir l&rsquo;objet ↗
          </a>
        )}
      </div>
      <button type="button" className="wish-check" aria-label={`Marquer « ${souhait.nom} » comme acheté`} onClick={(e) => onAchete(e.currentTarget)}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>
    </li>
  )
}

export function Wishlist({ onOpenSouhait, onAchete }: WishlistProps) {
  const [filtreSalleId, setFiltreSalleId] = useState<string>('toutes')
  const souhaits = useLiveQuery(() => db.souhaits.orderBy('ordre').toArray())
  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!souhaits || !salles) {
    return (
      <section className="floor">
        <div className="wish-header">
          <h1>Wishlist</h1>
        </div>
      </section>
    )
  }

  const sallesParId = new Map(salles.map((s) => [s.id, s]))
  const idsSallesAvecSouhait = new Set(souhaits.map((s) => s.salleId))
  const sallesDesSouhaits = salles.filter((s) => idsSallesAvecSouhait.has(s.id!))

  const reordonnable = filtreSalleId === 'toutes'
  const souhaitsFiltres = souhaits.filter((s) => reordonnable || s.salleId === Number(filtreSalleId))
  const totalPrixAchat = souhaitsFiltres.reduce((total, s) => total + s.prixAchat, 0)

  function handleDragEndSouhaits(event: DragEndEvent) {
    const { active, over } = event
    if (!reordonnable || !over || active.id === over.id) return
    const oldIndex = souhaits!.findIndex((s) => s.id === active.id)
    const newIndex = souhaits!.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const nouvelOrdre = arrayMove(souhaits!, oldIndex, newIndex).map((s) => s.id!)
    reordonnerSouhaits(nouvelOrdre)
  }

  return (
    <section className="floor">
      <div className="wish-header">
        <h1>Wishlist</h1>
        {souhaits.length > 0 && (
          <p className="room-sub wish-total">
            {souhaitsFiltres.length} souhait{souhaitsFiltres.length > 1 ? 's' : ''} · <strong>{euro.format(totalPrixAchat / 100)}</strong>
          </p>
        )}
      </div>
      {souhaits.length === 0 ? (
        <p className="note">Aucun souhait pour l&rsquo;instant.</p>
      ) : (
        <>
          {sallesDesSouhaits.length > 1 && (
            <div className="field">
              <label htmlFor="filtreSalleWishlist">Filtrer par collection</label>
              <select id="filtreSalleWishlist" value={filtreSalleId} onChange={(e) => setFiltreSalleId(e.target.value)}>
                <option value="toutes">Toutes les collections</option>
                {sallesDesSouhaits.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.numero} · {s.nom}
                  </option>
                ))}
              </select>
              {!reordonnable && <p className="note">Le réordonnancement n&rsquo;est possible que sans filtre.</p>}
            </div>
          )}

          {souhaitsFiltres.length === 0 ? (
            <p className="note">Aucun souhait dans cette collection.</p>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEndSouhaits}>
              <SortableContext items={souhaitsFiltres.map((s) => s.id!)} strategy={verticalListSortingStrategy}>
                <ul className="items">
                  {souhaitsFiltres.map((souhait) => (
                    <WishRow
                      key={souhait.id}
                      souhait={souhait}
                      salle={sallesParId.get(souhait.salleId)}
                      reordonnable={reordonnable}
                      onOpen={(opener) => onOpenSouhait(souhait.id!, opener)}
                      onAchete={(opener) => onAchete(souhait.id!, opener)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </section>
  )
}
