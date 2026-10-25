import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { FLOORS } from '../data/floors'

export type ElevatorHandle = {
  /** Joue la séquence complète (fermeture → trajet → ouverture) et appelle
   *  `onDoorsClosed` une fois les portes fermées, pour permuter le contenu de l'étage
   *  pendant qu'il est masqué — comme dans la maquette. */
  run: (fromIndex: number, toIndex: number, onDoorsClosed: () => void) => Promise<void>
}

const EASE_DOORS = 'cubic-bezier(.65,0,.35,1)'
const angle = (i: number) => -60 + i * 40

export const Elevator = forwardRef<ElevatorHandle>(function Elevator(_props, ref) {
  const lintelRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<SVGGElement>(null)
  const arrowDownRef = useRef<SVGSVGElement>(null)
  const arrowUpRef = useRef<SVGSVGElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const cabinRef = useRef<HTMLDivElement>(null)
  const doorLRef = useRef<HTMLDivElement>(null)
  const doorRRef = useRef<HTMLDivElement>(null)
  const streakLRef = useRef<HTMLDivElement>(null)
  const streakRRef = useRef<HTMLDivElement>(null)
  // État React local (pas une prop du parent) : un re-render déclenché par le
  // parent pendant l'animation (ex. `onDoorsClosed` → setState) relit cette
  // valeur telle quelle, il ne la réinitialise pas comme le ferait un `hidden`
  // écrit en dur dans le JSX.
  const [hidden, setHidden] = useState(true)

  useImperativeHandle(ref, () => ({
    async run(fromIndex, toIndex, onDoorsClosed) {
      const dir = toIndex > fromIndex ? 1 : -1
      const steps = Math.abs(toIndex - fromIndex)
      const needle = needleRef.current!
      const lintel = lintelRef.current!
      const dL = doorLRef.current!
      const dR = doorRRef.current!
      const cabin = cabinRef.current!
      const streaks = [streakLRef.current!, streakRRef.current!]

      needle.style.transform = `rotate(${angle(fromIndex)}deg)`
      if (labelRef.current) labelRef.current.textContent = FLOORS[fromIndex].level
      arrowUpRef.current?.classList.toggle('on', dir > 0)
      arrowDownRef.current?.classList.toggle('on', dir < 0)
      setHidden(false)

      const anims: Animation[] = []
      const run = (el: Element, kf: Keyframe[], opt: KeyframeAnimationOptions) => {
        const a = el.animate(kf, { fill: 'forwards', ...opt })
        anims.push(a)
        return a.finished
      }

      // 1. fermeture des portes
      await Promise.all([
        run(dL, [{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)' }], { duration: 560, easing: EASE_DOORS }),
        run(dR, [{ transform: 'translateX(101%)' }, { transform: 'translateX(0)' }], { duration: 560, easing: EASE_DOORS }),
        run(lintel, [{ transform: 'translateY(-102%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' }),
      ])
      onDoorsClosed()

      // 2. trajet
      const T = 950 + 380 * (steps - 1)
      const travel: Promise<Animation>[] = [
        run(needle, [{ transform: `rotate(${angle(fromIndex)}deg)` }, { transform: `rotate(${angle(toIndex)}deg)` }], { duration: T, easing: 'ease-in-out' }),
        run(
          cabin,
          [
            { transform: 'translateY(0)' },
            { transform: `translateY(${dir * 3}px)`, offset: 0.12 },
            { transform: `translateY(${dir}px)`, offset: 0.5 },
            { transform: `translateY(${-dir * 2}px)`, offset: 0.88 },
            { transform: 'translateY(0)' },
          ],
          { duration: T, easing: 'ease-in-out' },
        ),
      ]
      streaks.forEach((s) => {
        travel.push(
          run(
            s,
            [
              { transform: `translateY(${dir > 0 ? '-50%' : '0%'})`, opacity: 0 },
              { opacity: 0.9, offset: 0.2 },
              { opacity: 0.9, offset: 0.8 },
              { transform: `translateY(${dir > 0 ? '0%' : '-50%'})`, opacity: 0 },
            ],
            { duration: T, easing: 'linear' },
          ),
        )
      })
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          if (labelRef.current) labelRef.current.textContent = FLOORS[fromIndex + dir * i].level
        }, (T * i) / steps - 60)
      }
      await Promise.all(travel)

      // 3. ouverture
      await Promise.all([
        run(dL, [{ transform: 'translateX(0)' }, { transform: 'translateX(-101%)' }], { duration: 620, easing: EASE_DOORS, delay: 180 }),
        run(dR, [{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], { duration: 620, easing: EASE_DOORS, delay: 180 }),
        run(lintel, [{ transform: 'translateY(0)' }, { transform: 'translateY(-102%)' }], { duration: 420, easing: 'ease-in', delay: 520 }),
      ])
      setHidden(true)
      anims.forEach((a) => a.cancel())
      needle.style.transform = `rotate(${angle(toIndex)}deg)`
    },
  }))

  return (
    <div className="lift" hidden={hidden} aria-hidden="true">
      <div className="lintel" ref={lintelRef}>
        <div className="dial">
          <svg viewBox="0 0 200 108" aria-hidden="true">
            <path d="M22 100 A78 78 0 0 1 178 100" fill="rgba(0,0,0,.25)" stroke="#c9a45c" strokeWidth={2} />
            <g>
              {FLOORS.map((floor, i) => {
                const a = (angle(i) * Math.PI) / 180
                const x1 = 100 + 78 * Math.sin(a)
                const y1 = 100 - 78 * Math.cos(a)
                const x2 = 100 + 70 * Math.sin(a)
                const y2 = 100 - 70 * Math.cos(a)
                const lx = 100 + 57 * Math.sin(a)
                const ly = 100 - 57 * Math.cos(a) + 5
                return (
                  <g key={floor.key}>
                    <line x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#c9a45c" strokeWidth={2} />
                    <text x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight={600} fontSize={15} fill="#e8cc8c">
                      {floor.key}
                    </text>
                  </g>
                )
              })}
            </g>
            <g ref={needleRef} id="needle" style={{ transformBox: 'view-box', transformOrigin: '100px 100px' }}>
              <polygon points="98,100 102,100 100,38" fill="#f0d18e" />
              <circle cx={100} cy={100} r={6} fill="#c9a45c" stroke="#5d4519" />
            </g>
          </svg>
        </div>
        <div className="lift-row">
          <svg className="arrow" ref={arrowDownRef} viewBox="0 0 12 10">
            <polygon points="0,0 12,0 6,10" />
          </svg>
          <span ref={labelRef}>{FLOORS[0].level}</span>
          <svg className="arrow" ref={arrowUpRef} viewBox="0 0 12 10">
            <polygon points="0,10 12,10 6,0" />
          </svg>
        </div>
      </div>
      <div className="shaft">
        <div className="cabin" ref={cabinRef}>
          <div className="ldoor l" ref={doorLRef}>
            <div className="streaks" ref={streakLRef} />
          </div>
          <div className="ldoor r" ref={doorRRef}>
            <div className="streaks" ref={streakRRef} />
          </div>
        </div>
      </div>
    </div>
  )
})
