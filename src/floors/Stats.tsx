import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { valeurAchat, valeurAchatParAnnee, valeurRevente } from '../lib/valeurObjet'
import type { Objet, Salle } from '../db/types'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const CHART_COLORS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']

type LigneSalle = {
  salle: Salle
  nombre: number
  totalAchat: number
  totalRevente: number
}

function calculerLignesParSalle(salles: Salle[], objets: Objet[]): LigneSalle[] {
  return salles.map((salle) => {
    const objetsSalle = objets.filter((o) => o.salleId === salle.id)
    return {
      salle,
      nombre: objetsSalle.length,
      totalAchat: objetsSalle.reduce((total, o) => total + valeurAchat(o, salle), 0),
      totalRevente: objetsSalle.reduce((total, o) => total + (valeurRevente(o, salle) ?? 0), 0),
    }
  })
}

/** Groupe une liste d'objets par année d'achat, en sommant la valeur extraite de chacun. */
function grouperParAnnee(objets: Objet[], extraire: (o: Objet) => number): [number, number][] {
  const totaux = new Map<number, number>()
  for (const objet of objets) {
    if (objet.achatAnnee == null) continue
    totaux.set(objet.achatAnnee, (totaux.get(objet.achatAnnee) ?? 0) + extraire(objet))
  }
  return [...totaux.entries()].sort((a, b) => a[0] - b[0])
}

/** Comme grouperParAnnee, mais répartit la valeur d'achat de chaque objet sur toute sa plage
 *  d'acquisition (achatAnnee → achatAnneeFin) plutôt que de tout porter sur une seule année. */
function grouperValeurAchatEtalee(objets: Objet[], sallesParId: Map<number | undefined, Salle>): [number, number][] {
  const totaux = new Map<number, number>()
  for (const objet of objets) {
    const parAnnee = valeurAchatParAnnee(objet, sallesParId.get(objet.salleId))
    for (const [annee, valeur] of parAnnee) {
      totaux.set(annee, (totaux.get(annee) ?? 0) + valeur)
    }
  }
  return [...totaux.entries()].sort((a, b) => a[0] - b[0])
}

type BarreProps = {
  label: string
  valeur: number
  max: number
  afficher: (v: number) => string
}

function Barre({ label, valeur, max, afficher }: BarreProps) {
  const largeur = max > 0 ? (valeur / max) * 100 : 0
  return (
    <div className="bar-row euro">
      <span>{label}</span>
      <div className="track">
        <div className="fill" style={{ width: `${largeur}%` }} />
      </div>
      <span className="v">{afficher(valeur)}</span>
    </div>
  )
}

type CamembertProps = {
  lignes: LigneSalle[]
}

/** Transforme des parts de valeur en tranches cumulées (début/fin en %) pour le conic-gradient. */
function calculerPartsCamembert(lignesNonNulles: LigneSalle[], total: number) {
  return lignesNonNulles.reduce<{ ligne: LigneSalle; pct: number; debut: number; fin: number; couleur: string }[]>((parts, ligne, i) => {
    const debut = parts.length ? parts[parts.length - 1].fin : 0
    const pct = (ligne.totalAchat / total) * 100
    parts.push({ ligne, pct, debut, fin: debut + pct, couleur: CHART_COLORS[i % CHART_COLORS.length] })
    return parts
  }, [])
}

function Camembert({ lignes }: CamembertProps) {
  const lignesNonNulles = lignes.filter((l) => l.totalAchat > 0)
  const total = lignesNonNulles.reduce((s, l) => s + l.totalAchat, 0)
  if (total === 0) return <p className="note">Pas assez de données pour le camembert.</p>

  const parts = calculerPartsCamembert(lignesNonNulles, total)

  return (
    <div className="pie-wrap">
      <div
        className="pie"
        style={{ background: `conic-gradient(${parts.map((p) => `var(${p.couleur}) ${p.debut}% ${p.fin}%`).join(',')})` }}
      />
      <ul className="pie-legend">
        {parts.map((p) => (
          <li key={p.ligne.salle.id}>
            <span className="pie-dot" style={{ background: `var(${p.couleur})` }} />
            <span className="pie-legend-nom">{p.ligne.salle.nom}</span>
            <span className="v">{Math.round(p.pct)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type HistogrammeAnnuelProps = {
  entrees: [number, number][]
}

function HistogrammeAnnuel({ entrees }: HistogrammeAnnuelProps) {
  if (entrees.length === 0) return <p className="note">Pas assez de données pour cet histogramme.</p>
  const max = Math.max(...entrees.map(([, total]) => total), 1)
  return (
    <>
      <div className="cols">
        {entrees.map(([annee, total]) => (
          <div className="col" key={annee}>
            <span className="v">{euro.format(total / 100)}</span>
            <div className="bar" style={{ height: `${(total / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="years">
        {entrees.map(([annee]) => (
          <span key={annee}>{annee}</span>
        ))}
      </div>
    </>
  )
}

type CourbeEvolutionProps = {
  salles: Salle[]
  objets: Objet[]
}

/** Transforme des totaux annuels en points de dépense cumulée (somme courante). */
function calculerPointsCumules(parAnnee: [number, number][]) {
  return parAnnee.reduce<{ annee: number; cumule: number }[]>((points, [annee, total]) => {
    const precedent = points.length ? points[points.length - 1].cumule : 0
    points.push({ annee, cumule: precedent + total })
    return points
  }, [])
}

function CourbeEvolution({ salles, objets }: CourbeEvolutionProps) {
  const [salleFiltre, setSalleFiltre] = useState<'toutes' | number>('toutes')
  const sallesParId = new Map(salles.map((s) => [s.id, s]))
  const objetsFiltres = salleFiltre === 'toutes' ? objets : objets.filter((o) => o.salleId === salleFiltre)
  const parAnnee = grouperValeurAchatEtalee(objetsFiltres, sallesParId)
  const points = calculerPointsCumules(parAnnee)
  const cumul = points.length ? points[points.length - 1].cumule : 0

  const PAD_X = 26
  const PAD_TOP = 24
  const PAD_BOTTOM = 10
  const LARGEUR = 300
  const HAUTEUR = 136
  const maxCumule = points.length ? points[points.length - 1].cumule : 1
  const x = (i: number) => PAD_X + (points.length > 1 ? (i * (LARGEUR - 2 * PAD_X)) / (points.length - 1) : 0)
  const y = (v: number) => HAUTEUR - PAD_BOTTOM - (maxCumule > 0 ? (v / maxCumule) * (HAUTEUR - PAD_TOP - PAD_BOTTOM) : 0)
  const basse = HAUTEUR - PAD_BOTTOM

  return (
    <div>
      <div className="evo-head">
        <label htmlFor="evoSalle">Salle</label>
        <select
          id="evoSalle"
          value={salleFiltre}
          onChange={(e) => setSalleFiltre(e.target.value === 'toutes' ? 'toutes' : Number(e.target.value))}
        >
          <option value="toutes">Toutes les salles</option>
          {salles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.numero} · {s.nom}
            </option>
          ))}
        </select>
      </div>

      {points.length === 0 ? (
        <p className="note">Pas assez de données pour tracer une courbe.</p>
      ) : (
        <>
          <svg className="chart-svg" viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true">
            <defs>
              <linearGradient id="evoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brass-hi)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--brass-hi)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M ${x(0)},${basse} ${points.map((p, i) => `L ${x(i)},${y(p.cumule)}`).join(' ')} L ${x(points.length - 1)},${basse} Z`}
              fill="url(#evoGradient)"
            />
            <polyline points={points.map((p, i) => `${x(i)},${y(p.cumule)}`).join(' ')} fill="none" stroke="var(--brass-hi)" strokeWidth={2} />
            {points.map((p, i) => (
              <g key={p.annee}>
                <circle cx={x(i)} cy={y(p.cumule)} r={3} fill="var(--brass-hi)" />
                <text x={x(i)} y={y(p.cumule) - 8} textAnchor="middle" fontSize={9} fill="var(--fg)">
                  {euro.format(p.cumule / 100)}
                </text>
              </g>
            ))}
          </svg>
          <div className="years">
            {points.map((p) => (
              <span key={p.annee}>{p.annee}</span>
            ))}
          </div>
          <p className="note">Dépense cumulée : {euro.format(cumul / 100)} (somme des prix d&rsquo;achat, pas une valeur de marché).</p>
        </>
      )}
    </div>
  )
}

export function Stats() {
  const [onglet, setOnglet] = useState<'apercu' | 'graphiques'>('apercu')
  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const objets = useLiveQuery(() => db.objets.toArray())

  if (!salles || !objets) {
    return (
      <section className="floor">
        <h1>Statistiques</h1>
      </section>
    )
  }

  if (objets.length === 0) {
    return (
      <section className="floor">
        <h1>Statistiques</h1>
        <p className="note">Aucun objet pour l&rsquo;instant.</p>
      </section>
    )
  }

  const sallesParId = new Map(salles.map((s) => [s.id, s]))
  const lignes = calculerLignesParSalle(salles, objets)
  const valeurTotale = objets.reduce((total, o) => total + valeurAchat(o, sallesParId.get(o.salleId)), 0)
  const objetsAvecRevente = objets.filter((o) => o.prixRevente != null)
  const reventeTotale = objetsAvecRevente.reduce((total, o) => total + (valeurRevente(o, sallesParId.get(o.salleId)) ?? 0), 0)
  const favorisCount = objets.filter((o) => o.favori).length

  const lignesParNombre = [...lignes].sort((a, b) => b.nombre - a.nombre)
  const maxNombre = Math.max(...lignes.map((l) => l.nombre), 1)
  const lignesParAchat = [...lignes].sort((a, b) => b.totalAchat - a.totalAchat)
  const maxAchat = Math.max(...lignes.map((l) => l.totalAchat), 1)
  const lignesParRevente = [...lignes].sort((a, b) => b.totalRevente - a.totalRevente)
  const maxRevente = Math.max(...lignes.map((l) => l.totalRevente), 1)

  const comptesParAnnee = grouperParAnnee(objets, () => 1)
  const maxParAnnee = Math.max(...comptesParAnnee.map(([, n]) => n), 1)
  const totauxAchatParAnnee = grouperValeurAchatEtalee(objets, sallesParId)

  const objetPlusAncien = objets
    .map((o) => ({ objet: o, annee: o.anneeCreation ?? o.achatAnnee }))
    .filter((c): c is { objet: Objet; annee: number } => c.annee != null)
    .reduce<{ objet: Objet; annee: number } | null>((plusAncien, c) => (!plusAncien || c.annee < plusAncien.annee ? c : plusAncien), null)
  const salleDuPlusAncien = objetPlusAncien ? salles.find((s) => s.id === objetPlusAncien.objet.salleId) : undefined

  return (
    <section className="floor">
      <h1>Statistiques</h1>

      <div className="tabs" role="tablist">
        <button className="tab" type="button" role="tab" aria-selected={onglet === 'apercu'} onClick={() => setOnglet('apercu')}>
          Aperçu
        </button>
        <button className="tab" type="button" role="tab" aria-selected={onglet === 'graphiques'} onClick={() => setOnglet('graphiques')}>
          Graphiques
        </button>
      </div>

      {onglet === 'apercu' && (
        <div role="tabpanel" className="floor">
          <div className="kpis">
            <div className="kpi">
              <b>{euro.format(valeurTotale / 100)}</b>
              <span>valeur totale</span>
            </div>
            <div className="kpi">
              <b>{objetsAvecRevente.length > 0 ? euro.format(reventeTotale / 100) : '—'}</b>
              <span>revente potentielle</span>
            </div>
            <div className="kpi">
              <b>{favorisCount}</b>
              <span>favoris</span>
            </div>
          </div>

          <div className="home-sec">
            <h2>Objets par salle</h2>
            <div className="bars">
              {lignesParNombre.map(({ salle, nombre }) => (
                <Barre key={salle.id} label={salle.nom} valeur={nombre} max={maxNombre} afficher={(v) => `${v}`} />
              ))}
            </div>
          </div>

          <div className="home-sec">
            <h2>Valeur d&rsquo;achat par salle</h2>
            <div className="bars">
              {lignesParAchat.map(({ salle, totalAchat }) => (
                <Barre key={salle.id} label={salle.nom} valeur={totalAchat} max={maxAchat} afficher={(v) => euro.format(v / 100)} />
              ))}
            </div>
          </div>

          {objetsAvecRevente.length > 0 && (
            <div className="home-sec">
              <h2>Revente potentielle par salle</h2>
              <div className="bars">
                {lignesParRevente.map(({ salle, totalRevente }) => (
                  <Barre key={salle.id} label={salle.nom} valeur={totalRevente} max={maxRevente} afficher={(v) => euro.format(v / 100)} />
                ))}
              </div>
            </div>
          )}

          {comptesParAnnee.length > 0 && (
            <div className="home-sec">
              <h2>Acquisitions par année</h2>
              <div className="cols">
                {comptesParAnnee.map(([annee, n]) => (
                  <div className="col" key={annee}>
                    <span className="v">{n}</span>
                    <div className="bar" style={{ height: `${(n / maxParAnnee) * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="years">
                {comptesParAnnee.map(([annee]) => (
                  <span key={annee}>{annee}</span>
                ))}
              </div>
            </div>
          )}

          {objetPlusAncien && (
            <p className="note">
              Objet le plus ancien : {objetPlusAncien.objet.nom} · {objetPlusAncien.objet.marque}, {objetPlusAncien.annee}
              {salleDuPlusAncien && ` (Salle ${salleDuPlusAncien.numero})`}.
            </p>
          )}
        </div>
      )}

      {onglet === 'graphiques' && (
        <div role="tabpanel" className="floor">
          <div className="home-sec">
            <h2>Répartition de la valeur par salle</h2>
            <Camembert lignes={lignes} />
          </div>

          <div className="home-sec">
            <h2>Total d&rsquo;achat par année</h2>
            <HistogrammeAnnuel entrees={totauxAchatParAnnee} />
          </div>

          <div className="home-sec">
            <h2>Évolution de la dépense cumulée</h2>
            <CourbeEvolution salles={salles} objets={objets} />
          </div>
        </div>
      )}
    </section>
  )
}
