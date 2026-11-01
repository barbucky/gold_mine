import { db } from './database'
import { supprimerPhotoDuSouhait } from './photos'
import type { Souhait } from './types'

/** Nouveau souhait ajouté en bas de la liste de priorité (rang le plus bas = à prioriser soi-même). */
export async function creerSouhait(donnees: Omit<Souhait, 'id' | 'creeLe' | 'ordre'>) {
  const compte = await db.souhaits.count()
  return db.souhaits.add({ ...donnees, ordre: compte, creeLe: new Date() })
}

export function obtenirSouhait(id: number) {
  return db.souhaits.get(id)
}

export function modifierSouhait(id: number, changements: Partial<Omit<Souhait, 'id' | 'creeLe'>>) {
  return db.souhaits.update(id, changements)
}

export async function supprimerSouhait(id: number) {
  await supprimerPhotoDuSouhait(id)
  await db.souhaits.delete(id)
}

/** Réordonne les souhaits selon l'ordre fourni (ids) — glisser-déposer dans la Wishlist. */
export async function reordonnerSouhaits(idsOrdonnes: number[]) {
  await Promise.all(idsOrdonnes.map((id, i) => db.souhaits.update(id, { ordre: i })))
}
