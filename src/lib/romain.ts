const CHIFFRES: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function versRomain(n: number): string {
  let reste = n
  let resultat = ''
  for (const [valeur, symbole] of CHIFFRES) {
    while (reste >= valeur) {
      resultat += symbole
      reste -= valeur
    }
  }
  return resultat
}

const VALEURS_ROMAIN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

export function depuisRomain(s: string): number | null {
  const str = s.trim().toUpperCase()
  if (!/^[IVXLCDM]+$/.test(str)) return null
  let total = 0
  for (let i = 0; i < str.length; i++) {
    const cur = VALEURS_ROMAIN[str[i]]
    const suivant = VALEURS_ROMAIN[str[i + 1]]
    total += suivant && cur < suivant ? -cur : cur
  }
  return total
}

/** Chiffre romain suivant le plus grand numéro de salle existant (I si aucune salle). */
export function prochainNumeroRomain(numerosExistants: string[]): string {
  const valeurs = numerosExistants.map(depuisRomain).filter((n): n is number => n != null)
  const max = valeurs.length ? Math.max(...valeurs) : 0
  return versRomain(max + 1)
}
