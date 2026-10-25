import { db } from './database'
import type { Objet } from './types'

export function creerObjet(donnees: Omit<Objet, 'id' | 'creeLe' | 'modifieLe'>) {
  const maintenant = new Date()
  return db.objets.add({ ...donnees, creeLe: maintenant, modifieLe: maintenant })
}

export function listerObjetsDeLaSalle(salleId: number) {
  return db.objets.where('salleId').equals(salleId).toArray()
}

export function obtenirObjet(id: number) {
  return db.objets.get(id)
}

export function modifierObjet(id: number, changements: Partial<Omit<Objet, 'id' | 'creeLe'>>) {
  return db.objets.update(id, { ...changements, modifieLe: new Date() })
}

export function supprimerObjet(id: number) {
  return db.objets.delete(id)
}

export function compterObjetsDeLaSalle(salleId: number) {
  return db.objets.where('salleId').equals(salleId).count()
}
