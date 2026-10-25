import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ElevatorPanel } from './components/ElevatorPanel'
import { Elevator, type ElevatorHandle } from './components/Elevator'
import { AddButton } from './components/AddButton'
import { FLOORS } from './data/floors'
import { useReducedMotion } from './lib/useReducedMotion'
import { Home } from './floors/Home'
import { Collections } from './floors/Collections'
import { Stats } from './floors/Stats'

const FLOOR_VIEWS = [Home, Collections, Stats]
const TOAST_DURATION = 3000

function App() {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const elevatorRef = useRef<ElevatorHandle>(null)
  const mainRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast])

  async function goTo(index: number) {
    if (busy || index === current) return
    setBusy(true)

    if (reducedMotion) {
      const main = mainRef.current!
      await main.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).finished
      setCurrent(index)
      await main.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'forwards' }).finished
    } else {
      await elevatorRef.current?.run(current, index, () => setCurrent(index))
    }

    setBusy(false)
  }

  const FloorView = FLOOR_VIEWS[current]

  return (
    <div className="app">
      <Header floor={FLOORS[current]} />
      <main className="app-main" ref={mainRef}>
        <FloorView />
      </main>
      <AddButton onClick={() => setToast('Le formulaire d’ajout arrive à l’étape 9.')} />
      {toast && <div className="toast">{toast}</div>}
      <ElevatorPanel current={current} disabled={busy} onGo={goTo} />
      <Elevator ref={elevatorRef} />
    </div>
  )
}

export default App
