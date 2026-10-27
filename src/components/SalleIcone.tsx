import { useObjectUrl } from '../lib/useObjectUrl'
import type { Salle } from '../db/types'

type SalleIconeProps = {
  salle: Salle | undefined
  taille?: number
}

/** Logo/icône d'une collection, si elle en a une — rien sinon (pas de placeholder). */
export function SalleIcone({ salle, taille = 18 }: SalleIconeProps) {
  const url = useObjectUrl(salle?.icone)
  if (!url) return null
  return <img src={url} alt="" className="salle-icone" style={{ width: taille, height: taille }} />
}
