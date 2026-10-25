import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { chargerJeuDExemple } from '../db/seed'

export function Collections() {
  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const comptesParSalle = useLiveQuery(async () => {
    const objets = await db.objets.toArray()
    const comptes = new Map<number, number>()
    for (const objet of objets) {
      comptes.set(objet.salleId, (comptes.get(objet.salleId) ?? 0) + 1)
    }
    return comptes
  })

  return (
    <section className="floor">
      <h1>Mes collections</h1>

      {salles && salles.length === 0 && (
        <>
          <p className="note">Aucune salle pour l&rsquo;instant.</p>
          <button className="primary" type="button" onClick={() => chargerJeuDExemple()}>
            Charger un jeu d&rsquo;exemple
          </button>
        </>
      )}

      {salles && salles.length > 0 && (
        <ul className="debug-list">
          {salles.map((salle) => (
            <li key={salle.id}>
              {salle.numero} · {salle.nom} — {comptesParSalle?.get(salle.id!) ?? 0} objet(s)
            </li>
          ))}
        </ul>
      )}

      <p className="note">Rendu final (vignettes sous vitre) : arrive à l&rsquo;étape 3.</p>
    </section>
  )
}
