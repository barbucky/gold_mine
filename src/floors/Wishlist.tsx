import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Vitrine } from '../components/Vitrine'
import { SalleIcone } from '../components/SalleIcone'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type WishlistProps = {
  onOpenSouhait: (souhaitId: number, opener: HTMLElement | null) => void
  onAchete: (souhaitId: number, opener: HTMLElement | null) => void
}

export function Wishlist({ onOpenSouhait, onAchete }: WishlistProps) {
  const [filtreSalleId, setFiltreSalleId] = useState<string>('toutes')
  const souhaits = useLiveQuery(() => db.souhaits.orderBy('creeLe').reverse().toArray())
  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())

  if (!souhaits || !salles) {
    return (
      <section className="floor floor--wishlist">
        <h1>Wishlist</h1>
      </section>
    )
  }

  const sallesParId = new Map(salles.map((s) => [s.id, s]))
  const idsSallesAvecSouhait = new Set(souhaits.map((s) => s.salleId))
  const sallesDesSouhaits = salles.filter((s) => idsSallesAvecSouhait.has(s.id!))

  const souhaitsFiltres = souhaits.filter((s) => filtreSalleId === 'toutes' || s.salleId === Number(filtreSalleId))
  const totalPrixAchat = souhaitsFiltres.reduce((total, s) => total + s.prixAchat, 0)

  return (
    <section className="floor floor--wishlist">
      <h1>Wishlist</h1>
      {souhaits.length === 0 ? (
        <p className="note">Aucun souhait pour l&rsquo;instant.</p>
      ) : (
        <>
          <p className="room-sub">
            {souhaitsFiltres.length} souhait{souhaitsFiltres.length > 1 ? 's' : ''} · {euro.format(totalPrixAchat / 100)}
          </p>

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
            </div>
          )}

          {souhaitsFiltres.length === 0 ? (
            <p className="note">Aucun souhait dans cette collection.</p>
          ) : (
            <ul className="items">
              {souhaitsFiltres.map((souhait) => {
                const salle = sallesParId.get(souhait.salleId)
                return (
                  <li className="item" key={souhait.id}>
                    <div className="item-wishlist-body">
                      <button className="item-open" type="button" onClick={(e) => onOpenSouhait(souhait.id!, e.currentTarget)}>
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
                    <button
                      type="button"
                      className="wish-check"
                      aria-label={`Marquer « ${souhait.nom} » comme acheté`}
                      onClick={(e) => onAchete(souhait.id!, e.currentTarget)}
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
