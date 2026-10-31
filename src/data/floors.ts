export type Floor = {
  key: 'R' | '1' | '2' | '3'
  /** Nom complet, utilisé dans l'en-tête : "1er étage · Mes collections". */
  name: string
  /** Libellé court du bouton d'appel, en pied de page. */
  shortName: string
  level: string
}

export const FLOORS: Floor[] = [
  { key: 'R', name: 'Accueil', shortName: 'Accueil', level: 'Rez-de-chaussée' },
  { key: '1', name: 'Mes collections', shortName: 'Collections', level: '1er étage' },
  { key: '2', name: 'Wishlist', shortName: 'Wishlist', level: '2e étage' },
  { key: '3', name: 'Statistiques', shortName: 'Statistiques', level: '3e étage' },
]
