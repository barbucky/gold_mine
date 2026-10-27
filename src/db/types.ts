export type TypeChamp = 'texte' | 'progression'

export type ChampPersonnalise = {
  nom: string
  type: TypeChamp
}

/** Progression d'une série (ex. mangas) : tomes possédés du n° `du` au n° `au`, et si la série est complète. */
export type ValeurProgression = { du: number; au: number; complet: boolean }

/** Valeur d'un champ personnalisé : texte libre, ou progression d'une série. */
export type ValeurChamp = string | ValeurProgression

export type Salle = {
  id?: number
  numero: string // "I", "II"…
  nom: string
  ordre: number
  creeLe: Date
  /** Gabarit de champs proposés à l'ajout d'un objet de cette salle. */
  champsPersonnalises: ChampPersonnalise[]
  /** Logo/icône de la collection (toujours ré-encodé en PNG carré à l'import, quel que soit le format d'origine). */
  icone?: Blob
}

export type Objet = {
  id?: number
  salleId: number
  nom: string
  marque: string
  /** Nombre d'exemplaires identiques possédés (ex. 2 paires de lunettes identiques). Défaut 1. */
  quantite?: number
  /** Texte libre affiché, ex. "Circa 1956". */
  dateAffichee: string
  /** Année de fabrication/création de l'objet (distincte de l'achat), pas toujours connue. */
  anneeCreation?: number
  achatMois?: number
  achatAnnee?: number
  /** Dernière année d'achat si l'acquisition s'est étalée sur plusieurs années (ex. série de mangas) — sert à répartir la valeur dans les statistiques, pas à l'affichage courant. */
  achatAnneeFin?: number
  /** Centimes, EUR. */
  prixAchat: number
  /** Centimes, EUR. */
  prixRevente?: number
  provenance: string
  /** Référence libre (ex. référence constructeur/catalogue), distincte du n° d'inventaire. */
  reference?: string
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

/** Facture/document attaché à un objet (specs.md § 7bis) — photo ou PDF uniquement. */
export type PieceJointe = {
  id?: number
  objetId: number
  type: 'photo' | 'pdf'
  fichier: Blob
  nomFichier: string
  tailleOctets: number
  ajouteLe: Date
}

export type Reglage = {
  cle: string
  valeur: unknown
}
