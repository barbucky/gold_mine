import { useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

type FavoriteCoinProps = {
  pressed: boolean
  label: string
  onToggle: () => void
}

/** Pièce de la marque (icône de l'app) : grise si non favori, dorée si favori (specs.md § 4.5).
 *  Jamais un signet, une étoile ou un cœur. */
export function FavoriteCoin({ pressed, label, onToggle }: FavoriteCoinProps) {
  const coinRef = useRef<HTMLImageElement>(null)
  const reducedMotion = useReducedMotion()

  function handleClick() {
    const devientFavori = !pressed
    if (!reducedMotion && coinRef.current) {
      if (devientFavori) {
        coinRef.current.animate(
          [
            { transform: 'rotateY(0) scale(1)' },
            { transform: 'rotateY(180deg) scale(1.25)', offset: 0.5 },
            { transform: 'rotateY(360deg) scale(1)' },
          ],
          { duration: 520, easing: 'cubic-bezier(.3,.7,.3,1)' },
        )
      } else {
        coinRef.current.animate([{ transform: 'scale(1)' }, { transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 220 })
      }
    }
    onToggle()
  }

  return (
    <button className="mark" type="button" aria-pressed={pressed} aria-label={label} onClick={handleClick}>
      <img className="coin" ref={coinRef} src="/favicon-32.png" alt="" width={28} height={28} />
    </button>
  )
}
