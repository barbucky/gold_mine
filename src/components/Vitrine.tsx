/** Vignette sous vitre (specs.md § 2). Vide pour l'instant : les photos (et l'image par
 *  défaut par catégorie) arrivent aux étapes 5-6. */
export function Vitrine() {
  return (
    <svg className="vit-svg" viewBox="0 0 120 120" aria-hidden="true">
      <rect width={120} height={120} fill="#10234a" />
      <rect width={120} height={120} fill="url(#vSpot)" opacity={0.55} />
      <rect width={120} height={120} fill="url(#vGlass)" />
      <polygon points="70,0 92,0 30,120 8,120" fill="#fff" opacity={0.05} />
      <rect x={0.5} y={0.5} width={119} height={119} fill="none" stroke="#fff" strokeOpacity={0.28} />
      <rect x={3.5} y={3.5} width={113} height={113} fill="none" stroke="#fff" strokeOpacity={0.07} />
    </svg>
  )
}
