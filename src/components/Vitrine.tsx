import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useObjectUrl } from '../lib/useObjectUrl'

type VitrineProps = {
  objetId?: number
  /** Icône de la salle, utilisée comme image par défaut si l'objet n'a pas de photo. */
  iconeSalle?: Blob
  /** Série complète (champ personnalisé « progression ») : affiche un ruban doré dans l'angle. */
  complet?: boolean
  /** Taille en px (carré). Par défaut 104px, défini par `.vit-svg`. */
  taille?: number
}

/** Vignette sous vitre (specs.md § 2). Affiche la miniature si une photo a été importée,
 *  sinon l'icône de la salle (grisée) comme image par défaut si elle existe. */
export function Vitrine({ objetId, iconeSalle, complet, taille }: VitrineProps) {
  const photo = useLiveQuery(() => (objetId != null ? db.photos.where('objetId').equals(objetId).first() : undefined), [objetId])
  const url = useObjectUrl(photo?.miniature)
  const iconeUrl = useObjectUrl(!url ? iconeSalle : undefined)

  return (
    <svg
      className="vit-svg"
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={taille ? { width: taille, height: taille } : undefined}
    >
      <rect width={120} height={120} fill="#10234a" />
      <rect width={120} height={120} fill="url(#vSpot)" opacity={0.55} />
      {url ? (
        <g transform="translate(0 -6)">
          <ellipse cx={60} cy={104} rx={30} ry={4} fill="#000" opacity={0.35} />
          <image href={url} x={14} y={14} width={92} height={90} preserveAspectRatio="xMidYMax meet" />
        </g>
      ) : (
        iconeUrl && <image href={iconeUrl} x={30} y={30} width={60} height={60} opacity={0.5} style={{ filter: 'grayscale(1)' }} />
      )}
      <rect width={120} height={120} fill="url(#vGlass)" />
      <polygon points="70,0 92,0 30,120 8,120" fill="#fff" opacity={0.05} />
      <rect x={0.5} y={0.5} width={119} height={119} fill="none" stroke="#fff" strokeOpacity={0.28} />
      <rect x={3.5} y={3.5} width={113} height={113} fill="none" stroke="#fff" strokeOpacity={0.07} />
      {complet && (
        <g transform="rotate(-45 21 21)">
          <rect x={-60} y={12} width={160} height={20} fill="#c9a45c" stroke="#5d4519" strokeWidth={0.5} />
          <text x={21} y={25.5} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={700} fontSize={7.5} letterSpacing={0.3} fill="#1c1405">
            COMPLETED
          </text>
        </g>
      )}
    </svg>
  )
}
