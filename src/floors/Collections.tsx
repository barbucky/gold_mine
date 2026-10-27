import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { modifierObjet } from '../db/objets'
import { chargerJeuDExemple } from '../db/seed'
import { Vitrine } from '../components/Vitrine'
import { FavoriteCoin } from '../components/FavoriteCoin'
import { SalleIcone } from '../components/SalleIcone'
import { useReducedMotion } from '../lib/useReducedMotion'
import { OPTIONS_TRI, trierObjets, type TriCle } from '../lib/triObjets'
import { quantiteObjet, trouverProgression, valeurAchat, valeurAchatUnitaire } from '../lib/valeurObjet'
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

export function Collections({ onOpenObjet, onOpenGestionSalles }: CollectionsProps) {
  const [salleOuverteId, setSalleOuverteId] = useState<number | null>(null)
  const [tri, setTri] = useState<TriCle>('recent')
  const reducedMotion = useReducedMotion()
  const estPremierRendu = useRef(true)
  const roomsRef = useRef<HTMLDivElement>(null)
  const roomRef = useRef<HTMLDivElement>(null)

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const objets = useLiveQuery(() => db.objets.toArray())

  const statsParSalle = new Map<number, StatsSalle>()
  if (salles && objets) {
    for (const salle of salles) {
      statsParSalle.set(salle.id!, calculerStats(objets.filter((o) => o.salleId === salle.id), salle))
    }
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
  const objetsDeLaSalle = salleOuverte ? trierObjets(objets.filter((o) => o.salleId === salleOuverte.id), tri) : []
  const nombreDansLaSalle = salleOuverte ? statsParSalle.get(salleOuverte.id!)?.nombre ?? 0 : 0

  return (
    <section className="floor">
      {!salleOuverte && (
        <div ref={roomsRef}>
          <div className="sec-head">
            <h1>Mes collections</h1>
            <button className="link" type="button" onClick={onOpenGestionSalles}>
              Gérer les salles
            </button>
          </div>
          <div className="rooms">
            {salles.map((salle) => {
              const stats = statsParSalle.get(salle.id!)
              const periode =
                stats?.anneeMin != null
                  ? stats.anneeMin === stats.anneeMax
                    ? `${stats.anneeMin}`
                    : `${stats.anneeMin} – ${stats.anneeMax}`
                  : null
              const sousTitre = [periode, stats?.dernierAjout && `dernier ajout : ${stats.dernierAjout.nom} · ${stats.dernierAjout.marque}`]
                .filter(Boolean)
                .join(' · ')
              return (
                <button className="room" type="button" key={salle.id} onClick={() => setSalleOuverteId(salle.id!)}>
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
              )
            })}
          </div>
        </div>
      )}

      {salleOuverte && (
        <div ref={roomRef}>
          <div className="room-head">
            <button className="back" type="button" onClick={() => setSalleOuverteId(null)}>
              ‹ Mes collections
            </button>
            <div className="eyebrow">Salle {salleOuverte.numero}</div>
            <h1>
              <SalleIcone salle={salleOuverte} taille={28} /> {salleOuverte.nom}
            </h1>
            <p className="room-sub">
              {nombreDansLaSalle} objet{nombreDansLaSalle > 1 ? 's' : ''} · {euro.format((statsParSalle.get(salleOuverte.id!)?.totalPrixAchat ?? 0) / 100)}
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
          <ul className="items">
            {objetsDeLaSalle.map((objet) => (
              <li className="item" key={objet.id}>
                <button className="item-open" type="button" onClick={(e) => onOpenObjet(objet.id!, e.currentTarget)}>
                  <span className="vit">
                    <Vitrine objetId={objet.id} complet={trouverProgression(objet, salleOuverte)?.complet} />
                  </span>
                  <span className="info">
                    <span className="it-title">{objet.nom}</span>
                    <span className="it-brand">{objet.marque}</span>
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
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
