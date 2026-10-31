import Dexie, { type Table } from 'dexie'
import type { Objet, Photo, PieceJointe, Reglage, Salle, Souhait } from './types'

class McGoldMineDB extends Dexie {
  salles!: Table<Salle, number>
  objets!: Table<Objet, number>
  photos!: Table<Photo, number>
  piecesJointes!: Table<PieceJointe, number>
  souhaits!: Table<Souhait, number>
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
    this.version(3).stores({
      salles: '++id, ordre',
      objets: '++id, salleId, favori, achatAnnee, anneeCreation',
      photos: '++id, objetId',
      piecesJointes: '++id, objetId',
      reglages: 'cle',
    })
    this.version(4).stores({
      salles: '++id, ordre',
      objets: '++id, salleId, favori, achatAnnee, anneeCreation',
      photos: '++id, objetId, souhaitId',
      piecesJointes: '++id, objetId',
      souhaits: '++id, salleId',
      reglages: 'cle',
    })
    // v4 indexait souhaits sans creeLe, alors que Wishlist.tsx trie par date d'ajout
    // (`orderBy('creeLe')`) — SchemaError à l'exécution. Corrigé en v5.
    this.version(5).stores({
      salles: '++id, ordre',
      objets: '++id, salleId, favori, achatAnnee, anneeCreation',
      photos: '++id, objetId, souhaitId',
      piecesJointes: '++id, objetId',
      souhaits: '++id, salleId, creeLe',
      reglages: 'cle',
    })
  }
}

export const db = new McGoldMineDB()
