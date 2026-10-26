import Dexie, { type Table } from 'dexie'
import type { Objet, Photo, Reglage, Salle } from './types'

class McGoldMineDB extends Dexie {
  salles!: Table<Salle, number>
  objets!: Table<Objet, number>
  photos!: Table<Photo, number>
  reglages!: Table<Reglage, string>

  constructor() {
    super('mcs-gold-mine')
    this.version(1).stores({
      salles: '++id, ordre',
      objets: '++id, salleId, favori, achatAnnee',
      photos: '++id, objetId',
      reglages: 'cle',
    })
    this.version(2).stores({
      salles: '++id, ordre',
      objets: '++id, salleId, favori, achatAnnee, anneeCreation',
      photos: '++id, objetId',
      reglages: 'cle',
    })
  }
}

export const db = new McGoldMineDB()
