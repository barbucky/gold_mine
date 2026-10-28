import type { Objet, ValeurAssociation, ValeurChamp } from '../db/types'

export function estAssociation(valeur: ValeurChamp | undefined): valeur is ValeurAssociation {
  return typeof valeur === 'object' && valeur.genre === 'association'
}

/** Objets dont un champ « association » pointe vers `objetId` — ex. les jeux liés à une console. */
export function trouverObjetsLies(objets: Objet[], objetId: number): { objet: Objet; champNom: string }[] {
  const resultats: { objet: Objet; champNom: string }[] = []
  for (const o of objets) {
    for (const [champNom, valeur] of Object.entries(o.details)) {
      if (estAssociation(valeur) && valeur.objetId === objetId) {
        resultats.push({ objet: o, champNom })
      }
    }
  }
  return resultats
}
