// Scène 3D de l'intro — reprise de la maquette (docs/maquettes/ma-galerie.html),
// autorisé tel quel par CLAUDE.md. Réorganisée en module autonome (pas de DOM global),
// pour être pilotée depuis le composant React Intro.tsx.
import * as THREE from 'three'
import { rng, dessinerMarbre, dessinerPlaque, dessinerTableau, dessinerCartel, dessinerOmbre } from './textures'
import { prepareImage } from '../lib/images'
import type { ObjetVitrine } from '../db/intro'

export function estWebglDisponible(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export type IntroSceneOptions = {
  /** Appelé une fois (fin naturelle à t > 3,1 s avec 650 ms, ou `skip()` avec 260 ms),
   *  avec la durée de fondu à jouer côté React (specs.md § 4.1). */
  onEnded: (fadeMs: number) => void
  /** URL de la texture de la pièce (icône de l'app, § 2). */
  coinTextureUrl: string
  /** Jusqu'à 8 objets à exposer (favoris en priorité, § 9). */
  objets: ObjetVitrine[]
}

export type IntroSceneHandle = {
  start: () => void
  /** Stoppe immédiatement l'animation et déclenche `onEnded(260)` (tap, touche, Échap). */
  skip: () => void
  /** Libère tous les objets GPU (géométries, matériaux, textures, contexte WebGL). */
  dispose: () => void
}

const COULOIR_LONGUEUR = 46
const COIN_RAYON = 0.58

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o)

function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  return m
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function createIntroScene(canvas: HTMLCanvasElement, options: IntroSceneOptions): IntroSceneHandle {
  const rand = rng(1956)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  // Exposition relevée : Three.js calcule l'éclairage de façon physique depuis r155,
  // les intensités réglées pour l'ancien modèle (r128, maquette) rendaient la scène trop sombre.
  renderer.toneMappingExposure = 1.3

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x8d857a)
  scene.fog = new THREE.Fog(0x8d857a, 16, 62)

  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 90)

  function texture(c: HTMLCanvasElement): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return t
  }

  let pivL: THREE.Group
  let pivR: THREE.Group

  function construireCouloir() {
    const wallMat = std({ color: 0x8a8175, roughness: 0.95 })
    const baseMat = std({ color: 0x1c1a17, roughness: 0.6 })
    const brass = std({ color: 0xd4ae5f, metalness: 0.9, roughness: 0.25 })
    const gold = std({ color: 0xc59a45, metalness: 0.92, roughness: 0.3 })
    const doorWood = std({ color: 0x2a1d14, roughness: 0.42 })
    const doorPan = std({ color: 0x34251a, roughness: 0.38 })
    const outWall = std({ color: 0x2a2622, roughness: 0.92 })
    const ceilMat = std({ color: 0x9d958a, roughness: 1 })

    const marbre = texture(dessinerMarbre(rand))
    marbre.wrapS = marbre.wrapT = THREE.RepeatWrapping
    marbre.repeat.set(1.75, 11.5)

    const L = COULOIR_LONGUEUR
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, L), std({ map: marbre, roughness: 0.16, metalness: 0.02 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.z = -L / 2
    scene.add(floor)

    const vest = new THREE.Mesh(new THREE.PlaneGeometry(7, 10), std({ map: marbre, color: 0x5c5852, roughness: 0.2 }))
    vest.rotation.x = -Math.PI / 2
    vest.position.z = 5
    scene.add(vest)

    const strip = new THREE.MeshBasicMaterial({ color: 0xfff1d8 })
    ;[-1, 1].forEach((s) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(L, 5), wallMat)
      w.rotation.y = -s * (Math.PI / 2)
      w.position.set(s * 3.5, 2.5, -L / 2)
      scene.add(w)
      scene.add(box(0.05, 0.1, L, baseMat, s * 3.47, 0.05, -L / 2))
      scene.add(box(0.02, 0.025, L, gold, s * 3.47, 0.115, -L / 2))
      scene.add(box(0.04, 0.05, L, strip, s * 3.46, 4.82, -L / 2))
      const vw = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), outWall)
      vw.rotation.y = -s * (Math.PI / 2)
      vw.position.set(s * 3.5, 2.5, 5)
      scene.add(vw)
    })

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(7, L + 10), ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(0, 5, -L / 2 + 5)
    scene.add(ceil)
    ;[-1.2, 1.2].forEach((x) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.12, L - 2), strip)
      p.rotation.x = Math.PI / 2
      p.position.set(x, 4.98, -L / 2 - 1)
      scene.add(p)
    })

    const end = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), wallMat)
    end.position.set(0, 2.5, -L)
    scene.add(end)

    // mur d'entrée + encadrement de porte
    scene.add(box(2, 5, 0.3, outWall, -2.5, 2.5, 0))
    scene.add(box(2, 5, 0.3, outWall, 2.5, 2.5, 0))
    scene.add(box(3, 1.6, 0.3, outWall, 0, 4.2, 0))
    scene.add(box(0.18, 3.6, 0.42, gold, -1.59, 1.8, 0))
    scene.add(box(0.18, 3.6, 0.42, gold, 1.59, 1.8, 0))
    scene.add(box(3.36, 0.2, 0.42, gold, 0, 3.5, 0))

    const plaqueTex = texture(dessinerPlaque())
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), std({ map: plaqueTex, metalness: 0.6, roughness: 0.4 }))
    plaque.position.set(0, 4.15, 0.17)
    scene.add(plaque)

    // tableaux
    let pSeed = 3
    ;[-4, -12, -20, -28, -36].forEach((z) => {
      ;[-1, 1].forEach((s) => {
        const tw = 1.4 + rand() * 0.6
        const th = tw * 1.25
        const tex = texture(dessinerTableau(pSeed++))
        const frame = box(tw + 0.26, th + 0.26, 0.09, gold)
        frame.rotation.y = -s * (Math.PI / 2)
        frame.position.set(s * 3.43, 2.65, z + (s > 0 ? -1.5 : 1.5))
        scene.add(frame)
        const cv = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), std({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.28, roughness: 0.8 }))
        cv.rotation.y = -s * (Math.PI / 2)
        cv.position.set(s * 3.37, 2.65, frame.position.z)
        scene.add(cv)
        scene.add(box(0.08, 0.04, tw * 0.6, brass, s * 3.3, 2.65 + th / 2 + 0.3, frame.position.z))
      })
    })
    const bigTex = texture(dessinerTableau(11))
    scene.add(box(3.1, 2.4, 0.1, gold, 0, 2.6, -L + 0.06))
    const big = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.1), std({ map: bigTex, emissive: 0xffffff, emissiveMap: bigTex, emissiveIntensity: 0.35 }))
    big.position.set(0, 2.6, -L + 0.12)
    scene.add(big)

    // lumières — intensités relevées par rapport à la maquette (r128) : Three.js récent
    // calcule l'éclairage de façon physique (candela), les anciennes valeurs (0,3 à 1,2)
    // rendaient la scène quasi noire. À ajuster encore selon le rendu réel sur iPhone.
    scene.add(new THREE.AmbientLight(0x4a443c, 1.4))
    scene.add(new THREE.HemisphereLight(0xfff0d8, 0x2a2622, 1))
    const entree = new THREE.PointLight(0xffe2b8, 35, 12, 1.5)
    entree.position.set(0, 3.6, -L + 4)
    scene.add(entree)
    ;[-5, -13, -21, -29, -37].forEach((z) => {
      const p = new THREE.PointLight(0xffe6c4, 28, 15, 1.8)
      p.position.set(0, 4.3, z)
      scene.add(p)
    })
    // Positionnées exactement au niveau des 4 paires de vitrines (phase B) : dédiées à leur éclairage,
    // sans faisceau ni rampe visible (juste de vraies lumières, aucune géométrie de source).
    ;[-8, -16, -24, -32].forEach((z) => {
      const p = new THREE.PointLight(0xffe2b8, 55, 6, 2)
      p.position.set(0, 2.3, z)
      scene.add(p)
    })
    // Seule lumière dédiée au vestibule/porte (les autres n'éclairent que le couloir) : renforcée.
    const lamp = new THREE.PointLight(0xffc77a, 95, 11, 2)
    lamp.position.set(0, 4.2, 4)
    scene.add(lamp)

    return { doorWood, doorPan, brass }
  }

  // [côté (-1 gauche / 1 droite), z] pour chacune des 8 vitrines, alternées.
  const POSITIONS_VITRINES: [number, number][] = [
    [-1, -8],
    [1, -8],
    [-1, -16],
    [1, -16],
    [-1, -24],
    [1, -24],
    [-1, -32],
    [1, -32],
  ]

  function construireVitrines(objets: ObjetVitrine[]) {
    const socleMat = std({ color: 0xe9e5de, roughness: 0.7 }) // socle blanc mat
    const brass = std({ color: 0xd4ae5f, metalness: 0.9, roughness: 0.25 })
    const glass = std({ color: 0xcfe8e0, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide })
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
    const shadowTex = texture(dessinerOmbre())

    objets.slice(0, POSITIONS_VITRINES.length).forEach((objet, i) => {
      const [s, z] = POSITIONS_VITRINES[i]
      const g = new THREE.Group()
      g.position.set(s * 2.25, 0, z)
      g.add(box(0.9, 1.05, 0.9, socleMat, 0, 0.525, 0))
      g.add(box(0.95, 0.05, 0.95, brass, 0, 1.075, 0))
      g.add(box(0.84, 0.82, 0.84, glass, 0, 1.51, 0))
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.84, 0.82, 0.84)), edgeMat)
      e.position.y = 1.51
      g.add(e)

      // présentoir fixe, tourné vers l'allée pour faire face au visiteur
      const holder = new THREE.Group()
      holder.position.y = 1.1
      holder.rotation.y = -s * 0.42
      g.add(holder)

      const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }))
      sh.rotation.x = -Math.PI / 2
      sh.position.y = 0.004
      holder.add(sh)

      if (objet.image) {
        const { canvas, detouree } = prepareImage(objet.image, 1024)
        const tex = texture(canvas)
        const maxW = 0.64
        const maxH = 0.62
        const ar = canvas.width / canvas.height
        let w = maxW
        let h = w / ar
        if (h > maxH) {
          h = maxH
          w = h * ar
        }
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.03, side: THREE.DoubleSide, toneMapped: false }),
        )
        if (detouree) {
          // photo détourée → l'objet seul, debout
          m.position.set(0, h / 2 + 0.004, 0)
        } else {
          // photo avec fond → tirage posé, légèrement incliné en arrière
          const lean = 0.1
          m.rotation.x = -lean
          m.position.set(0, Math.cos(lean) * (h / 2) + 0.004, -Math.sin(lean) * (h / 2))
        }
        holder.add(m)
        sh.scale.x = Math.max(0.5, w / 0.64)
      }

      const cartel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.225),
        std({ map: texture(dessinerCartel(objet.nom, objet.marque, `${objet.dateAffichee} · Inv. ${objet.inventaire}`)), roughness: 0.9 }),
      )
      cartel.position.set(0, 0.8, 0.456)
      g.add(cartel)

      scene.add(g)
    })
  }

  function construirePorte(doorWood: THREE.Material, doorPan: THREE.Material, brass: THREE.Material, coinTex: THREE.Texture) {
    const coinFace = std({ map: coinTex, metalness: 0.35, roughness: 0.32, emissive: 0xffffff, emissiveMap: coinTex, emissiveIntensity: 0.18 })
    const coinEdge = std({ color: 0xb88a35, metalness: 0.6, roughness: 0.3, emissive: 0x3a2808, side: THREE.DoubleSide })

    function coinHalf(side: number): THREE.Group {
      const g = new THREE.Group()
      const T = 0.045
      const face = new THREE.Mesh(new THREE.CircleGeometry(COIN_RAYON, 96, side < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI), coinFace)
      face.position.z = T / 2
      g.add(face)
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(COIN_RAYON, COIN_RAYON, T, 96, 1, true, side < 0 ? Math.PI : 0, Math.PI), coinEdge)
      rim.rotation.x = Math.PI / 2
      g.add(rim)
      const cut = new THREE.Mesh(new THREE.PlaneGeometry(T, COIN_RAYON * 2), coinEdge)
      cut.rotation.y = Math.PI / 2
      g.add(cut)
      return g
    }

    function door(sign: number): THREE.Group {
      const pivot = new THREE.Group()
      pivot.position.set(sign * 1.5, 0, 0)
      const p = new THREE.Group()
      p.position.x = -sign * 0.75
      pivot.add(p)
      p.add(box(1.49, 3.39, 0.1, doorWood, 0, 1.7, 0))
      ;[0.065, -0.065].forEach((z) => {
        p.add(box(1.05, 1.35, 0.03, doorPan, 0, 2.5, z))
        p.add(box(1.05, 1.15, 0.03, doorPan, 0, 0.95, z))
      })
      ;[0.11, -0.11].forEach((z) => p.add(box(0.04, 0.3, 0.05, brass, -sign * 0.6, 1.1, z)))
      const half = coinHalf(sign)
      half.position.set(-sign * 0.75, 2.18, 0.105)
      p.add(half)
      scene.add(pivot)
      return pivot
    }

    pivL = door(-1)
    pivR = door(1)
  }

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    cam.aspect = w / h
    cam.fov = cam.aspect < 0.8 ? 74 : 60
    cam.updateProjectionMatrix()
  }

  let t0 = 0
  let running = false
  let ended = false
  let rafId = 0

  // Pause supplémentaire devant la porte fermée, avant qu'elle ne commence à s'ouvrir.
  const PAUSE_PORTE = 0.35
  const DEBUT_TRAJET = 0.5 + PAUSE_PORTE
  // Trajet ralenti (2,9 s à l'origine, puis 4,4 s) pour laisser davantage le temps de distinguer les vitrines au passage.
  const DUREE_TRAJET = 7
  // Le fondu de sortie démarre un peu avant la fin du trajet (chevauchement voulu, comme la maquette).
  const FIN_ANIMATION = DEBUT_TRAJET + DUREE_TRAJET - 0.3

  function frame(now: number) {
    if (!running) return
    const t = (now - t0) / 1000
    const d = easeIO(clamp((t - 0.25 - PAUSE_PORTE) / 1.05)) * 1.62
    pivL.rotation.y = d
    pivR.rotation.y = -d
    const c = clamp((t - DEBUT_TRAJET) / DUREE_TRAJET)
    const z = 8 + (-15 - 8) * easeIO(c)
    // Fréquence de l'oscillation de marche compensée pour garder la même cadence réelle malgré le trajet allongé.
    cam.position.set(0, 1.65 + Math.sin(c * Math.PI * 7 * (DUREE_TRAJET / 2.9)) * 0.012, z)
    cam.lookAt(0, 1.62, z - 10)
    renderer.render(scene, cam)
    if (t > FIN_ANIMATION && !ended) {
      ended = true
      options.onEnded(650)
    }
    rafId = requestAnimationFrame(frame)
  }

  function start() {
    resize()
    window.addEventListener('resize', resize)
    running = true
    ended = false
    t0 = performance.now()
    rafId = requestAnimationFrame(frame)
  }

  function skip() {
    if (ended) return
    ended = true
    running = false
    cancelAnimationFrame(rafId)
    options.onEnded(260)
  }

  function dispose() {
    running = false
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      const mats = Array.isArray(mat) ? mat : mat ? [mat] : []
      for (const m of mats) {
        for (const key of ['map', 'emissiveMap', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap'] as const) {
          const tex = (m as unknown as Record<string, THREE.Texture | undefined>)[key]
          tex?.dispose()
        }
        m.dispose()
      }
    })
    renderer.dispose()
    renderer.forceContextLoss()
  }

  const { doorWood, doorPan, brass } = construireCouloir()
  construireVitrines(options.objets)

  const chargement = new THREE.TextureLoader().loadAsync(options.coinTextureUrl).then((coinTex) => {
    coinTex.colorSpace = THREE.SRGBColorSpace
    construirePorte(doorWood, doorPan, brass, coinTex)
  })

  return {
    start() {
      chargement.then(start)
    },
    skip,
    dispose,
  }
}
