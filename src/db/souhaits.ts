import { db } from './database'
import { supprimerPhotoDuSouhait } from './photos'
import type { Souhait } from './types'

export function creerSouhait(donnees: Omit<Souhait, 'id' | 'creeLe'>) {
  return db.souhaits.add({ ...donnees, creeLe: new Date() })
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
