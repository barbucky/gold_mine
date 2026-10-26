import type { Objet } from '../db/types'

export type TriCle =
  | 'recent'
  | 'nom'
  | 'anneeAchatDesc'
  | 'anneeAchatAsc'
  | 'anneeCreationDesc'
  | 'anneeCreationAsc'
  | 'prixAchatDesc'
  | 'prixAchatAsc'
  | 'prixReventeDesc'
  | 'prixReventeAsc'
  | 'favoris'

export const OPTIONS_TRI: { value: TriCle; label: string }[] = [
  { value: 'recent', label: 'Ajout récent → ancien' },
  { value: 'nom', label: 'Nom (A → Z)' },
  { value: 'anneeAchatDesc', label: "Année d'achat (récente → ancienne)" },
  { value: 'anneeAchatAsc', label: "Année d'achat (ancienne → récente)" },
  { value: 'anneeCreationDesc', label: 'Année de création (récente → ancienne)' },
  { value: 'anneeCreationAsc', label: 'Année de création (ancienne → récente)' },
  { value: 'prixAchatDesc', label: "Prix d'achat (décroissant)" },
  { value: 'prixAchatAsc', label: "Prix d'achat (croissant)" },
  { value: 'prixReventeDesc', label: 'Prix de revente (décroissant)' },
  { value: 'prixReventeAsc', label: 'Prix de revente (croissant)' },
  { value: 'favoris', label: 'Favoris d’abord' },
]

/** Compare deux valeurs numériques potentiellement absentes : les valeurs absentes passent toujours en fin de liste. */
function comparerNombresOptionnels(a: number | undefined, b: number | undefined, decroissant: boolean): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return decroissant ? b - a : a - b
}

export function trierObjets(objets: Objet[], tri: TriCle): Objet[] {
  const copie = [...objets]
  switch (tri) {
    case 'recent':
      return copie.sort((a, b) => b.creeLe.getTime() - a.creeLe.getTime())
    case 'nom':
      return copie.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    case 'anneeAchatDesc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.achatAnnee, b.achatAnnee, true))
    case 'anneeAchatAsc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.achatAnnee, b.achatAnnee, false))
    case 'anneeCreationDesc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.anneeCreation, b.anneeCreation, true))
    case 'anneeCreationAsc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.anneeCreation, b.anneeCreation, false))
    case 'prixAchatDesc':
      return copie.sort((a, b) => b.prixAchat - a.prixAchat)
    case 'prixAchatAsc':
      return copie.sort((a, b) => a.prixAchat - b.prixAchat)
    case 'prixReventeDesc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.prixRevente, b.prixRevente, true))
    case 'prixReventeAsc':
      return copie.sort((a, b) => comparerNombresOptionnels(a.prixRevente, b.prixRevente, false))
    case 'favoris':
      return copie.sort((a, b) => Number(b.favori) - Number(a.favori))
  }
}
