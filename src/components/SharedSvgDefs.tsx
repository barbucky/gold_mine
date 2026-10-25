/** Dégradés SVG partagés (vitrines), montés une seule fois et référencés via url(#id) depuis n'importe quel SVG de la page. */
export function SharedSvgDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="vSpot" cx="50%" cy="0%" r="100%">
          <stop offset="0" stopColor="#fff1d0" stopOpacity={0.6} />
          <stop offset="0.42" stopColor="#4a6aa0" stopOpacity={0.28} />
          <stop offset="1" stopColor="#0a1528" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="vGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
          <stop offset="0.3" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.52" stopColor="#fff" stopOpacity={0.07} />
          <stop offset="0.6" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  )
}
