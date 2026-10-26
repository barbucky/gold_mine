import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ElevatorPanel } from './components/ElevatorPanel'
import { Elevator, type ElevatorHandle } from './components/Elevator'
import { AddButton } from './components/AddButton'
import { SharedSvgDefs } from './components/SharedSvgDefs'
import { ObjectSheet, type ObjectSheetHandle } from './components/ObjectSheet'
import { Intro } from './components/Intro'
import { FLOORS } from './data/floors'
import { useReducedMotion } from './lib/useReducedMotion'
import { Home } from './floors/Home'
import { Collections } from './floors/Collections'
import { Stats } from './floors/Stats'

const TOAST_DURATION = 3000

function App() {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [introVisible, setIntroVisible] = useState(true)
  const elevatorRef = useRef<ElevatorHandle>(null)
  const objectSheetRef = useRef<ObjectSheetHandle>(null)
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

  function openObjet(objetId: number, opener: HTMLElement | null) {
    objectSheetRef.current?.open(objetId, opener)
  }

  function renderFloor() {
    switch (current) {
      case 0:
        return <Home onSeeAll={() => goTo(1)} onOpenObjet={openObjet} />
      case 1:
        return <Collections onOpenObjet={openObjet} />
      default:
        return <Stats />
    }
  }

  return (
    <div className="app">
      <SharedSvgDefs />
      <Header floor={FLOORS[current]} onReplayIntro={() => setIntroVisible(true)} />
      <main className="app-main" ref={mainRef}>
        {renderFloor()}
      </main>
      <AddButton onClick={() => setToast('Le formulaire d’ajout arrive à l’étape 9.')} />
      {toast && <div className="toast">{toast}</div>}
      <ElevatorPanel current={current} disabled={busy} onGo={goTo} />
      <Elevator ref={elevatorRef} />
      <ObjectSheet ref={objectSheetRef} onToast={setToast} />
      {introVisible && <Intro onFinished={() => setIntroVisible(false)} />}
    </div>
  )
}

export default App
