export type TypeChamp = 'texte' | 'progression'

export type ChampPersonnalise = {
  nom: string
  type: TypeChamp
}

/** Valeur d'un champ personnalisé : texte libre, ou progression (ex. volumes possédés). */
export type ValeurChamp = string | { actuel: number; total: number }

export type Salle = {
  id?: number
  numero: string // "I", "II"…
  nom: string
  ordre: number
  creeLe: Date
  /** Gabarit de champs proposés à l'ajout d'un objet de cette salle. */
  champsPersonnalises: ChampPersonnalise[]
}

export type Objet = {
  id?: number
  salleId: number
  nom: string
  marque: string
  /** Texte libre affiché, ex. "Circa 1956". */
  dateAffichee: string
  achatMois?: number
  achatAnnee?: number
  /** Centimes, EUR. */
  prixAchat: number
  /** Centimes, EUR. */
  prixRevente?: number
  provenance: string
  inventaire: string
  description: string
  favori: boolean
  creeLe: Date
  modifieLe: Date
  /** Champs personnalisés propres à cet objet (clé → valeur). */
  details: Record<string, ValeurChamp>
}

export type Photo = {
  id?: number
  objetId: number
  originale: Blob
  detouree: Blob | null
  miniature: Blob
  largeur: number
  hauteur: number
  estDetouree: boolean
}

export type Reglage = {
  cle: string
  valeur: unknown
}
