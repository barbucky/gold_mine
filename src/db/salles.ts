import { db } from './database'
import type { Salle } from './types'

export function creerSalle(donnees: Omit<Salle, 'id' | 'creeLe'>) {
  return db.salles.add({ ...donnees, creeLe: new Date() })
}

export function listerSalles() {
  return db.salles.orderBy('ordre').toArray()
}

export function obtenirSalle(id: number) {
  return db.salles.get(id)
}

export function modifierSalle(id: number, changements: Partial<Omit<Salle, 'id'>>) {
  return db.salles.update(id, changements)
}

export function supprimerSalle(id: number) {
  return db.salles.delete(id)
}
