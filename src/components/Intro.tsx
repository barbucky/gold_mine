import { useEffect, useMemo, useRef } from 'react'
import { createIntroScene, estWebglDisponible, type IntroSceneHandle } from '../intro/scene'
import { obtenirObjetsPourIntro } from '../db/intro'
import { useReducedMotion } from '../lib/useReducedMotion'

type IntroProps = {
  onFinished: () => void
}

/** Intro 3D (specs.md § 4.1). Sautée sans trace visuelle si `prefers-reduced-motion` ou pas de WebGL. */
export function Intro({ onFinished }: IntroProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<IntroSceneHandle | null>(null)
  const reducedMotion = useReducedMotion()
  const sauterEmblee = useMemo(() => reducedMotion || !estWebglDisponible(), [reducedMotion])

  useEffect(() => {
    if (sauterEmblee) {
      onFinished()
      return
    }
    if (!canvasRef.current) return

    let annule = false
    let scene: IntroSceneHandle | null = null

    obtenirObjetsPourIntro().then((objets) => {
      if (annule || !canvasRef.current) return

      scene = createIntroScene(canvasRef.current, {
        coinTextureUrl: '/coin-texture-1024.png',
        objets,
        onEnded: (fadeMs) => {
          if (annule) return
          const anim = rootRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs, easing: 'ease-in', fill: 'forwards' })
          const fini = () => {
            if (!annule) onFinished()
          }
          if (anim) anim.finished.then(fini, fini)
          else fini()
        },
      })
      sceneRef.current = scene

      const attendrePolices = document.fonts
        ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))])
        : Promise.resolve()
      attendrePolices.then(() => {
        if (annule) return
        scene?.start()
        rootRef.current?.focus({ preventScroll: true })
      })
    })

    return () => {
      annule = true
      scene?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sauterEmblee])

  function passer() {
    sceneRef.current?.skip()
  }

  if (sauterEmblee) return null

  return (
    <div
      className="intro"
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label="Passer l&rsquo;introduction"
      onPointerDown={passer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault()
          passer()
        }
      }}
    >
      <canvas ref={canvasRef} />
      <div className="intro-title">
        <b>MC&rsquo;S GOLD MINE</b>
      </div>
      <div className="intro-hint">Touchez pour entrer</div>
    </div>
  )
}
