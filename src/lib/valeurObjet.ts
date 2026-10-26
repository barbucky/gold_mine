import type { Objet, Salle, ValeurProgression } from '../db/types'

/** Valeur de progression de l'objet (tomes possédés), si sa salle définit un champ « progression ». */
export function trouverProgression(objet: Objet, salle: Salle | undefined): ValeurProgression | undefined {
  const champProgression = salle?.champsPersonnalises.find((c) => c.type === 'progression')
  if (!champProgression) return undefined
  const valeur = objet.details[champProgression.nom]
  return typeof valeur === 'object' && 'du' in valeur && 'au' in valeur ? valeur : undefined
}

/** Nombre de tomes possédés (du → au inclus), au moins 1. */
export function nombrePossede(progression: ValeurProgression): number {
  return Math.max(1, progression.au - progression.du + 1)
}

/**
 * Multiplicateur de valeur : nombre de volumes possédés si la salle de l'objet définit un
 * champ personnalisé de type « progression » (ex. une série de mangas où chaque volume vaut
 * le même prix unitaire), sinon 1 (comportement inchangé pour tous les autres objets).
 */
function multiplicateur(objet: Objet, salle: Salle | undefined): number {
  const progression = trouverProgression(objet, salle)
  return progression ? nombrePossede(progression) : 1
}

/** Valeur d'achat de l'objet (prix unitaire × volumes possédés le cas échéant). */
export function valeurAchat(objet: Objet, salle: Salle | undefined): number {
  return objet.prixAchat * multiplicateur(objet, salle)
}

/** Valeur de revente potentielle de l'objet, ou `undefined` si non renseignée. */
export function valeurRevente(objet: Objet, salle: Salle | undefined): number | undefined {
  if (objet.prixRevente == null) return undefined
  return objet.prixRevente * multiplicateur(objet, salle)
}

/**
 * Répartit la valeur d'achat d'un objet à parts égales sur chaque année comprise entre
 * `achatAnnee` et `achatAnneeFin` (incluses) — pour les séries acquises sur plusieurs années
 * (ex. mangas), afin que les statistiques par année ne portent pas tout le poids sur une
 * seule année. Sans `achatAnneeFin`, toute la valeur reste sur `achatAnnee` comme avant.
 */
export function valeurAchatParAnnee(objet: Objet, salle: Salle | undefined): Map<number, number> {
  const resultat = new Map<number, number>()
  if (objet.achatAnnee == null) return resultat
  const debut = objet.achatAnnee
  const fin = objet.achatAnneeFin != null && objet.achatAnneeFin > debut ? objet.achatAnneeFin : debut
  const part = valeurAchat(objet, salle) / (fin - debut + 1)
  for (let annee = debut; annee <= fin; annee++) {
    resultat.set(annee, part)
  }
  return resultat
}
