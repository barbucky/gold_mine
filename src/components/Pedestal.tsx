function grainPaths(x: number, y: number, w: number, h: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const yy = (y + (i + 0.5) * (h / n)).toFixed(1)
    return `M${x} ${yy} q ${w * 0.25} ${i % 2 ? 1.2 : -1.2} ${w * 0.5} 0 t ${w * 0.5} 0`
  })
}

/** Vitrine sur socle de la fiche objet (specs.md § 4.4). Vide pour l'instant : les photos
 *  arrivent à l'étape 5. Le `.sheen` reçoit l'animation de reflet jouée une fois à l'ouverture. */
export function Pedestal() {
  return (
    <svg viewBox="0 0 260 330" aria-hidden="true">
      <defs>
        <linearGradient id="pFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f0ea" />
          <stop offset="1" stopColor="#d2ccc2" />
        </linearGradient>
        <linearGradient id="pSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4bdb1" />
          <stop offset="1" stopColor="#a39b8f" />
        </linearGradient>
        <linearGradient id="pWood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5e3b21" />
          <stop offset="0.22" stopColor="#7f532f" />
          <stop offset="0.45" stopColor="#5a381f" />
          <stop offset="0.7" stopColor="#86593a" />
          <stop offset="1" stopColor="#5c3a20" />
        </linearGradient>
        <radialGradient id="pIn" cx="50%" cy="8%" r="95%">
          <stop offset="0" stopColor="#2a4a80" />
          <stop offset="1" stopColor="#0f2242" />
        </radialGradient>
        <clipPath id="pFace">
          <rect x={52} y={40} width={140} height={140} />
        </clipPath>
      </defs>

      <ellipse cx={130} cy={316} rx={100} ry={8} fill="#000" opacity={0.4} />

      {/* socle blanc mat */}
      <polygon points="194,198 210,188 210,302 194,312" fill="url(#pSide)" />
      <rect x={50} y={198} width={144} height={114} fill="url(#pFront)" />

      {/* plateau bois sous le verre */}
      <polygon points="46,180 62,170 214,170 198,180" fill="#6f4729" />
      <polygon points="198,180 214,170 214,188 198,198" fill="#3d2615" />
      <rect x={46} y={180} width={152} height={18} fill="url(#pWood)" />
      {grainPaths(46, 180, 152, 18, 3).map((d) => (
        <path key={d} d={d} stroke="#2b190c" strokeOpacity={0.28} strokeWidth={0.7} fill="none" />
      ))}

      {/* cage de verre */}
      <polygon points="52,40 68,30 208,30 192,40" fill="#cfe0f5" opacity={0.12} />
      <polygon points="192,40 208,30 208,170 192,180" fill="#1b3560" opacity={0.8} />
      <rect x={52} y={40} width={140} height={140} fill="url(#pIn)" />
      <rect x={52} y={40} width={140} height={140} fill="url(#vSpot)" opacity={0.6} />

      <g clipPath="url(#pFace)">
        <rect x={52} y={40} width={140} height={140} fill="url(#vGlass)" />
        <g className="sheen">
          <polygon points="40,180 70,180 130,40 100,40" fill="#fff" opacity={0.13} />
        </g>
      </g>
      <g fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={1}>
        <rect x={52.5} y={40.5} width={139} height={139} />
        <polyline points="192,180 208,170 208,30 68,30 52,40" />
        <line x1={192} y1={40} x2={208} y2={30} />
      </g>
    </svg>
  )
}
