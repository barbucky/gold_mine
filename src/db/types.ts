export type Salle = {
  id?: number
  numero: string // "I", "II"…
  nom: string
  ordre: number
  creeLe: Date
  /** Gabarit de noms de champs proposés à l'ajout d'un objet de cette salle. */
  champsPersonnalises: string[]
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
  details: Record<string, string>
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
