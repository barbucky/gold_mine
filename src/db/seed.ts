import { db } from './database'

/** Jeu d'exemple, chargé uniquement à la demande (jamais automatiquement). */
export async function chargerJeuDExemple() {
  const dejaDesSalles = await db.salles.count()
  if (dejaDesSalles > 0) return

  const salleAppareils = await db.salles.add({
    numero: 'I',
    nom: 'Appareils photo argentiques',
    ordre: 0,
    creeLe: new Date(),
    champsPersonnalises: [],
  })

  const salleVinyles = await db.salles.add({
    numero: 'II',
    nom: 'Vinyles de jazz',
    ordre: 1,
    creeLe: new Date(),
    champsPersonnalises: [],
  })

  const maintenant = new Date()
  await db.objets.bulkAdd([
    {
      salleId: salleAppareils,
      nom: 'M3, boîtier chromé',
      marque: 'Leica',
      dateAffichee: 'Circa 1956',
      anneeCreation: 1956,
      achatMois: 3,
      achatAnnee: 2026,
      prixAchat: 240_000,
      prixRevente: 260_000,
      provenance: 'Puces de Saint-Ouen',
      inventaire: '2026.118',
      description: "Télémètre réglé, rideaux d'obturateur neufs.",
      favori: true,
      creeLe: maintenant,
      modifieLe: maintenant,
      details: {},
    },
    {
      salleId: salleVinyles,
      nom: 'Kind of Blue',
      marque: 'Miles Davis',
      dateAffichee: 'Circa 1959',
      anneeCreation: 1959,
      achatMois: 9,
      achatAnnee: 2026,
      prixAchat: 45_000,
      prixRevente: 48_000,
      provenance: 'Disquaire, Paris',
      inventaire: '2026.127',
      description: 'Pressage américain à étiquette « 6-eye ».',
      favori: false,
      creeLe: maintenant,
      modifieLe: maintenant,
      details: {},
    },
  ])
}
