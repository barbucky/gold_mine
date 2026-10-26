// Textures procédurales de l'intro 3D, dessinées en canvas — reprises de la maquette
// (docs/maquettes/ma-galerie.html), autorisé tel quel par CLAUDE.md.

/** Générateur pseudo-aléatoire déterministe (même rendu à chaque lancement). */
export function rng(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function creerCanvas(w: number, h: number, dessiner: (g: CanvasRenderingContext2D, w: number, h: number) => void): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  dessiner(c.getContext('2d')!, w, h)
  return c
}

/** Marbre de Carrare : grandes dalles veinées, quelques filets dorés discrets. */
export function dessinerMarbre(rand: () => number): HTMLCanvasElement {
  return creerCanvas(1024, 1024, (g, w, h) => {
    g.fillStyle = '#eceae5'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i++) {
      const x = rand() * w
      const y = rand() * h
      const r = 60 + rand() * 220
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      const tone = rand() > 0.5 ? '150,146,140' : '255,253,248'
      gr.addColorStop(0, `rgba(${tone},${0.05 + rand() * 0.07})`)
      gr.addColorStop(1, `rgba(${tone},0)`)
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    const vein = (width: number, alpha: number, color: string) => {
      let x = rand() * w
      let y = -40
      let a = 0.9 + rand() * 0.6
      g.strokeStyle = `rgba(${color},${alpha})`
      g.lineWidth = width
      g.lineCap = 'round'
      g.beginPath()
      g.moveTo(x, y)
      while (y < h + 40) {
        a += (rand() - 0.5) * 0.5
        x += Math.cos(a) * 14
        y += Math.abs(Math.sin(a)) * 14 + 4
        g.lineTo(x, y)
        if (rand() < 0.04) {
          const sx = x
          const sy = y
          g.moveTo(sx, sy)
          g.lineTo(sx + (rand() - 0.5) * 90, sy + rand() * 60)
          g.moveTo(x, y)
        }
      }
      g.stroke()
    }
    try {
      g.filter = 'blur(2px)'
    } catch {
      /* non supporté : filets nets plutôt que flous */
    }
    for (let i = 0; i < 7; i++) vein(5 + rand() * 6, 0.1, '110,104,98')
    try {
      g.filter = 'blur(.6px)'
    } catch {
      /* non supporté */
    }
    for (let i = 0; i < 9; i++) vein(1 + rand() * 1.5, 0.32, '96,90,84')
    for (let i = 0; i < 2; i++) vein(1.2, 0.35, '176,140,70')
    try {
      g.filter = 'none'
    } catch {
      /* non supporté */
    }
    g.strokeStyle = 'rgba(120,114,106,.35)'
    g.lineWidth = 2
    for (let k = 0; k <= w; k += w / 2) {
      g.beginPath()
      g.moveTo(k, 0)
      g.lineTo(k, h)
      g.moveTo(0, k)
      g.lineTo(w, k)
      g.stroke()
    }
  })
}

/** Plaque en laiton gravée « Mc's Gold Mine », au-dessus de la porte. */
export function dessinerPlaque(): HTMLCanvasElement {
  return creerCanvas(1024, 160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#e6c987')
    gr.addColorStop(0.5, '#b58f45')
    gr.addColorStop(1, '#8a6a2e')
    g.fillStyle = gr
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#5d4519'
    g.lineWidth = 6
    g.strokeRect(10, 10, w - 20, h - 20)
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = "600 76px Cinzel, Georgia, serif"
    g.fillStyle = 'rgba(255,240,200,.55)'
    g.fillText("Mc's Gold Mine", w / 2, h / 2 + 6)
    g.fillStyle = '#3a2810'
    g.fillText("Mc's Gold Mine", w / 2, h / 2 + 4)
  })
}

const PALETTES = [
  ['#c9b48a', '#6f8a8f', '#4c5a3a', '#2e3a24', '#e2c27f'],
  ['#d6a46a', '#8c5a3c', '#5b3a28', '#2b1d14', '#f0d6a0'],
  ['#9fb3b6', '#5d7480', '#3e4f45', '#1f2a24', '#e6dcc0'],
  ['#b88c74', '#7a5a6a', '#4a3b48', '#251d26', '#f1c98e'],
  ['#c7c19a', '#8f9a6e', '#566141', '#2c3220', '#fff0c0'],
]

/** Tableau de paysage abstrait et générique (un par cadre, suffixe = graine). */
export function dessinerTableau(seed: number): HTMLCanvasElement {
  const r = rng(seed)
  const pal = PALETTES[seed % PALETTES.length]
  return creerCanvas(256, 320, (g, w, h) => {
    const sk = g.createLinearGradient(0, 0, 0, h * 0.7)
    sk.addColorStop(0, pal[1])
    sk.addColorStop(1, pal[0])
    g.fillStyle = sk
    g.fillRect(0, 0, w, h)
    g.fillStyle = pal[4]
    g.globalAlpha = 0.7
    g.beginPath()
    g.arc(40 + r() * 176, 50 + r() * 80, 14 + r() * 16, 0, 7)
    g.fill()
    g.globalAlpha = 1
    for (let layer = 0; layer < 3; layer++) {
      const base = h * (0.55 + layer * 0.12)
      g.fillStyle = pal[2 + Math.min(layer, 1)]
      g.beginPath()
      g.moveTo(0, h)
      for (let x = 0; x <= w; x += 8) {
        g.lineTo(x, base - Math.sin(x / (30 + r() * 4) + layer * 2 + r() * 0.3) * (14 + layer * 6) - r() * 4)
      }
      g.lineTo(w, h)
      g.fill()
    }
    for (let i = 0; i < 6; i++) {
      g.fillStyle = pal[3]
      g.beginPath()
      g.ellipse(r() * w, h * 0.6 + r() * h * 0.2, 6 + r() * 10, 18 + r() * 20, 0, 0, 7)
      g.fill()
    }
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75)
    v.addColorStop(0, 'rgba(0,0,0,0)')
    v.addColorStop(1, 'rgba(20,10,0,.55)')
    g.fillStyle = v
    g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(140,95,30,.18)'
    g.fillRect(0, 0, w, h)
  })
}

/** Cartel crème (étiquette de musée) : nom, marque, date · n° d'inventaire. */
export function dessinerCartel(titre: string, sousTitre: string, inventaire: string): HTMLCanvasElement {
  return creerCanvas(400, 180, (g, w, h) => {
    g.fillStyle = '#efe6d2'
    g.fillRect(0, 0, w, h)
    const fit = (txt: string, weight: number, size: number, fam: string) => {
      let z = size
      do {
        g.font = `${weight} ${z}px ${fam}`
        z -= 1
      } while (g.measureText(txt).width > w - 44 && z > 12)
    }
    g.fillStyle = '#211a12'
    fit(titre, 700, 32, 'Sora, Manrope, sans-serif')
    g.fillText(titre, 22, 56)
    fit(sousTitre, 600, 24, 'Manrope, sans-serif')
    g.fillText(sousTitre, 22, 98)
    g.fillStyle = '#6e5c40'
    g.font = '20px "IBM Plex Mono", monospace'
    g.fillText(inventaire, 22, 150)
  })
}

/** Ombre douce ovale, posée sous l'objet dans la vitrine. */
export function dessinerOmbre(): HTMLCanvasElement {
  return creerCanvas(128, 64, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    gr.addColorStop(0, 'rgba(0,0,0,.5)')
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.setTransform(1, 0, 0, 0.5, 0, h / 4)
    g.fillStyle = gr
    g.fillRect(0, 0, w, h * 2)
  })
}
