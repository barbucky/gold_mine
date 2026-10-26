import { db } from './database'
import { obtenirPhotoDeLObjet } from './photos'
import { chargerImage } from '../lib/images'
import type { Objet } from './types'

export type ObjetVitrine = {
  nom: string
  marque: string
  dateAffichee: string
  inventaire: string
  /** Chargée depuis la photo détourée (ou l'originale) de l'objet, si une photo existe. */
  image?: HTMLImageElement
}

/** Objets exposés dans les vitrines de l'intro : favoris en priorité (specs.md § 9),
 *  complété par les plus récents pour toujours remplir les 8 emplacements. */
export async function obtenirObjetsPourIntro(limite = 8): Promise<ObjetVitrine[]> {
  const tous = await db.objets.toArray()
  const parDateDesc = (a: Objet, b: Objet) => b.creeLe.getTime() - a.creeLe.getTime()
  const favoris = tous.filter((o) => o.favori).sort(parDateDesc)
  const autres = tous.filter((o) => !o.favori).sort(parDateDesc)
  const choisis = [...favoris, ...autres].slice(0, limite)

  return Promise.all(
    choisis.map(async (objet) => {
      let image: HTMLImageElement | undefined
      const photo = await obtenirPhotoDeLObjet(objet.id!)
      if (photo) {
        try {
          image = await chargerImage(photo.detouree ?? photo.originale)
        } catch {
          image = undefined
        }
      }
      return {
        nom: objet.nom,
        marque: objet.marque,
        dateAffichee: objet.dateAffichee,
        inventaire: objet.inventaire,
        image,
      }
    }),
  )
}
