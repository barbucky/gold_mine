import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Vitrine } from '../components/Vitrine'
import { SalleIcone } from '../components/SalleIcone'
import { obtenirDerniereSauvegarde } from '../lib/sauvegarde'
import { quantiteObjet, trouverProgression, valeurAchatUnitaire } from '../lib/valeurObjet'
import type { Objet, Salle } from '../db/types'

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const NB_RECENTS = 3
const RAPPEL_SAUVEGARDE_JOURS = 30

type HomeProps = {
  onSeeAll: () => void
  onOpenObjet: (objetId: number, opener: HTMLElement | null) => void
  onOpenBackup: () => void
}

function formatAnciennete(date: Date, maintenant: Date): string {
  const jours = Math.floor((maintenant.getTime() - date.getTime()) / 86_400_000)
  if (jours <= 0) return 'aujourd’hui'
  if (jours === 1) return 'hier'
  if (jours < 7) return `il y a ${jours} jours`
  if (jours < 30) {
    const semaines = Math.floor(jours / 7)
    return `il y a ${semaines} semaine${semaines > 1 ? 's' : ''}`
  }
  const mois = Math.floor(jours / 30)
  return `il y a ${mois} mois`
}

type RecentCardProps = {
  objet: Objet
  salle: Salle | undefined
  maintenant: Date
  onOpen: (opener: HTMLElement) => void
}

function RecentCard({ objet, salle, maintenant, onOpen }: RecentCardProps) {
  return (
    <button
      className="rcard"
      type="button"
      aria-label={`${objet.nom}, ${objet.marque}`}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <span className="vit">
        <Vitrine objetId={objet.id} iconeSalle={salle?.icone} complet={trouverProgression(objet, salle)?.complet} />
      </span>
      <span className="r-body">
        <span className="r-top">
          <span>
            <span className="r-name">{objet.nom}</span>
            <br />
            <span className="r-brand">{objet.marque}</span>
          </span>
          <span className="r-price">{euro.format(valeurAchatUnitaire(objet, salle) / 100)}</span>
        </span>
        <span className="r-desc">{objet.description}</span>
        <span className="r-foot">
          {salle && (
            <span className="chip">
              <SalleIcone salle={salle} taille={14} />
              {salle.nom}
            </span>
          )}
          <span className="it-date">{objet.dateAffichee}</span>
          <span className="r-inv">{formatAnciennete(objet.creeLe, maintenant)}</span>
        </span>
      </span>
    </button>
  )
}

export function Home({ onSeeAll, onOpenObjet, onOpenBackup }: HomeProps) {
  // Calculé une fois par affichage de l'étage (le composant est remonté à chaque retour sur Accueil).
  // oxlint-disable-next-line react/purity -- heure/date volontairement lues au rendu, figées via useMemo
  const maintenant = useMemo(() => new Date(), [])
  const salles = useLiveQuery(() => db.salles.toArray())
  const objets = useLiveQuery(() => db.objets.toArray())
  const derniereSauvegarde = useLiveQuery(() => obtenirDerniereSauvegarde())

  if (!salles || !objets) {
    return (
      <section className="floor home">
        <h1>Accueil</h1>
      </section>
    )
  }

  const heure = maintenant.getHours()
  const salutation = heure >= 18 || heure < 5 ? 'Bonsoir' : 'Bonjour'
  const dateDuJour = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const nombreObjets = objets.reduce((total, o) => total + quantiteObjet(o), 0)
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
  const ajoutsCeMois = objets.filter((o) => o.creeLe >= debutMois).reduce((total, o) => total + quantiteObjet(o), 0)

  const sallesParId = new Map(salles.map((s) => [s.id, s]))
  const recents = [...objets].sort((a, b) => b.creeLe.getTime() - a.creeLe.getTime()).slice(0, NB_RECENTS)

  const joursDepuisSauvegarde = derniereSauvegarde ? Math.floor((maintenant.getTime() - derniereSauvegarde.getTime()) / 86_400_000) : null
  const rappelSauvegarde = objets.length > 0 && (joursDepuisSauvegarde === null || joursDepuisSauvegarde > RAPPEL_SAUVEGARDE_JOURS)

  return (
    <section className="floor home">
      <div className="hello">
        <div className="hello-date">{dateDuJour}</div>
        <h1>{salutation}</h1>
      </div>

      {rappelSauvegarde && (
        <p className="note">
          {joursDepuisSauvegarde === null ? 'Aucune sauvegarde pour l’instant.' : `Dernière sauvegarde il y a ${joursDepuisSauvegarde} jours.`}{' '}
          <button className="link" type="button" onClick={onOpenBackup}>
            Sauvegarder maintenant
          </button>
        </p>
      )}

      <div className="kpis">
        <div className="kpi">
          <b>{nombreObjets}</b>
          <span>objets</span>
        </div>
        <div className="kpi">
          <b>{salles.length}</b>
          <span>collections</span>
        </div>
        <div className="kpi">
          <b>{ajoutsCeMois}</b>
          <span>ajouts ce mois-ci</span>
        </div>
      </div>

      <div className="home-sec">
        <div className="sec-head">
          <h2>Dernières acquisitions</h2>
          <button className="link" type="button" onClick={onSeeAll}>
            Tout voir
          </button>
        </div>
        {recents.length === 0 ? (
          <p className="note">Aucun objet pour l&rsquo;instant.</p>
        ) : (
          <div className="recent">
            {recents.map((objet) => (
              <RecentCard
                key={objet.id}
                objet={objet}
                salle={sallesParId.get(objet.salleId)}
                maintenant={maintenant}
                onOpen={(opener) => onOpenObjet(objet.id!, opener)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
