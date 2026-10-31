import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ElevatorPanel } from './components/ElevatorPanel'
import { Elevator, type ElevatorHandle } from './components/Elevator'
import { AddButton } from './components/AddButton'
import { SharedSvgDefs } from './components/SharedSvgDefs'
import { ObjectSheet, type ObjectSheetHandle } from './components/ObjectSheet'
import { AddEditSheet, type AddEditSheetHandle } from './components/AddEditSheet'
import { WishlistSheet, type WishlistSheetHandle } from './components/WishlistSheet'
import { BackupSheet } from './components/BackupSheet'
import { ManageSallesSheet } from './components/ManageSallesSheet'
import { Intro } from './components/Intro'
import { FLOORS } from './data/floors'
import { useReducedMotion } from './lib/useReducedMotion'
import { Home } from './floors/Home'
import { Collections } from './floors/Collections'
import { Wishlist } from './floors/Wishlist'
import { Stats } from './floors/Stats'

const ETAGE_WISHLIST = 2

const TOAST_DURATION = 3000

function App() {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [introVisible, setIntroVisible] = useState(true)
  const [backupOuvert, setBackupOuvert] = useState(false)
  const [gestionSallesOuverte, setGestionSallesOuverte] = useState(false)
  const elevatorRef = useRef<ElevatorHandle>(null)
  const objectSheetRef = useRef<ObjectSheetHandle>(null)
  const addEditRef = useRef<AddEditSheetHandle>(null)
  const wishlistSheetRef = useRef<WishlistSheetHandle>(null)
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

  function editObjet(objetId: number, opener: HTMLElement | null) {
    addEditRef.current?.openForEdit(objetId, opener)
  }

  function ouvrirSouhait(souhaitId: number, opener: HTMLElement | null) {
    wishlistSheetRef.current?.openForEdit(souhaitId, opener)
  }

  function marquerAchete(souhaitId: number, opener: HTMLElement | null) {
    addEditRef.current?.openFromSouhait(souhaitId, opener)
  }

  function renderFloor() {
    switch (current) {
      case 0:
        return <Home onSeeAll={() => goTo(1)} onOpenObjet={openObjet} onOpenBackup={() => setBackupOuvert(true)} />
      case 1:
        return <Collections onOpenObjet={openObjet} onOpenGestionSalles={() => setGestionSallesOuverte(true)} />
      case ETAGE_WISHLIST:
        return <Wishlist onOpenSouhait={ouvrirSouhait} onAchete={marquerAchete} />
      default:
        return <Stats />
    }
  }

  return (
    <div className="app">
      <SharedSvgDefs />
      <Header floor={FLOORS[current]} onReplayIntro={() => setIntroVisible(true)} onOpenBackup={() => setBackupOuvert(true)} />
      <main className="app-main" ref={mainRef}>
        {renderFloor()}
      </main>
      <AddButton
        onClick={(opener) =>
          current === ETAGE_WISHLIST ? wishlistSheetRef.current?.openForNew(opener) : addEditRef.current?.openForNew(opener)
        }
      />
      {toast && <div className="toast">{toast}</div>}
      <ElevatorPanel current={current} disabled={busy} onGo={goTo} />
      <Elevator ref={elevatorRef} />
      <ObjectSheet ref={objectSheetRef} onToast={setToast} onEdit={editObjet} />
      <AddEditSheet ref={addEditRef} onToast={setToast} />
      <WishlistSheet ref={wishlistSheetRef} onToast={setToast} />
      <BackupSheet open={backupOuvert} onClose={() => setBackupOuvert(false)} onToast={setToast} />
      <ManageSallesSheet open={gestionSallesOuverte} onClose={() => setGestionSallesOuverte(false)} onToast={setToast} />
      {introVisible && <Intro onFinished={() => setIntroVisible(false)} />}
    </div>
  )
}

export default App
