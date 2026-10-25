import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useObjectUrl } from '../lib/useObjectUrl'

type VitrineProps = {
  objetId?: number
}

/** Vignette sous vitre (specs.md § 2). Affiche la miniature si une photo a été importée. */
export function Vitrine({ objetId }: VitrineProps) {
  const photo = useLiveQuery(() => (objetId != null ? db.photos.where('objetId').equals(objetId).first() : undefined), [objetId])
  const url = useObjectUrl(photo?.miniature)

  return (
    <svg className="vit-svg" viewBox="0 0 120 120" aria-hidden="true">
      <rect width={120} height={120} fill="#10234a" />
      <rect width={120} height={120} fill="url(#vSpot)" opacity={0.55} />
      {url && (
        <g transform="translate(0 -6)">
          <ellipse cx={60} cy={104} rx={30} ry={4} fill="#000" opacity={0.35} />
          <image href={url} x={14} y={14} width={92} height={90} preserveAspectRatio="xMidYMax meet" />
        </g>
      )}
      <rect width={120} height={120} fill="url(#vGlass)" />
      <polygon points="70,0 92,0 30,120 8,120" fill="#fff" opacity={0.05} />
      <rect x={0.5} y={0.5} width={119} height={119} fill="none" stroke="#fff" strokeOpacity={0.28} />
      <rect x={3.5} y={3.5} width={113} height={113} fill="none" stroke="#fff" strokeOpacity={0.07} />
    </svg>
  )
}
