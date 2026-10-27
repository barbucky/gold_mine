import { db } from './database'
import { versRomain } from '../lib/romain'
import { chargerImage, formatIconeAccepte, redimensionnerCarre } from '../lib/images'
import type { Salle } from './types'

const TAILLE_ICONE = 128

export function creerSalle(donnees: Omit<Salle, 'id' | 'creeLe'>) {
  return db.salles.add({ ...donnees, creeLe: new Date() })
}

/** Importe (et remplace) l'icône/logo d'une salle — toujours ré-encodée en PNG carré. */
export async function importerIconeSalle(salleId: number, file: File) {
  if (!formatIconeAccepte(file)) {
    throw new Error('Format non reconnu. Formats acceptés : SVG, PNG, JPEG ou WebP.')
  }
  const image = await chargerImage(file)
  const icone = await redimensionnerCarre(image, TAILLE_ICONE)
  await db.salles.update(salleId, { icone })
}

export function supprimerIconeSalle(salleId: number) {
  return db.salles.update(salleId, { icone: undefined })
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

/** Supprime la salle puis renumérote les suivantes (I, II, III… sans trou) et compacte `ordre`. */
export async function supprimerSalle(id: number) {
  await db.salles.delete(id)
  const restantes = await db.salles.orderBy('ordre').toArray()
  await Promise.all(
    restantes.map((s, i) => {
      const numero = versRomain(i + 1)
      if (s.numero === numero && s.ordre === i) return undefined
      return db.salles.update(s.id!, { numero, ordre: i })
    }),
  )
}
