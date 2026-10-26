import { useEffect, useRef, useState } from 'react'
import { exporterSauvegarde, importerSauvegarde, obtenirDerniereSauvegarde } from '../lib/sauvegarde'
import { useReducedMotion } from '../lib/useReducedMotion'

type BackupSheetProps = {
  open: boolean
  onClose: () => void
  onToast: (message: string) => void
}

const formatDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function BackupSheet({ open, onClose, onToast }: BackupSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reducedMotion = useReducedMotion()

  const [derniere, setDerniere] = useState<Date | null>(null)
  const [enCours, setEnCours] = useState<'export' | 'import' | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    obtenirDerniereSauvegarde().then(setDerniere)
  }, [open])

  async function close() {
    if (!reducedMotion) {
      const anims = [
        overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, easing: 'ease-in', fill: 'forwards' }),
        sheetRef.current?.animate([{ transform: 'none' }, { transform: 'translateY(50px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }),
      ].filter((a): a is Animation => !!a)
      await Promise.all(anims.map((a) => a.finished)).catch(() => {})
    }
    setErreur(null)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    if (reducedMotion) return
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' })
    sheetRef.current?.animate([{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], {
      duration: 460,
      easing: 'cubic-bezier(.2,.8,.25,1)',
    })
  }, [open, reducedMotion])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleExport() {
    setEnCours('export')
    setErreur(null)
    try {
      await exporterSauvegarde()
      setDerniere(await obtenirDerniereSauvegarde())
      onToast('Sauvegarde téléchargée.')
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible de créer la sauvegarde.')
    } finally {
      setEnCours(null)
    }
  }

  function demanderFichier() {
    fileInputRef.current?.click()
  }

  async function handleFichierChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    if (!window.confirm('Restaurer cette sauvegarde va remplacer toutes les données actuelles de l’app. Continuer ?')) return
    setEnCours('import')
    setErreur(null)
    try {
      await importerSauvegarde(fichier)
      onToast('Sauvegarde restaurée.')
      await close()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible de restaurer cette sauvegarde.')
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div
      className="sheet-overlay"
      ref={overlayRef}
      hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sauvegardeTitre"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-bar">
          <h2 className="d-name" id="sauvegardeTitre" style={{ fontSize: 20 }}>
            Sauvegarde
          </h2>
          <button className="round" type="button" aria-label="Fermer" onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <p className="note">{derniere ? `Dernière sauvegarde : ${formatDate.format(derniere)}` : 'Aucune sauvegarde pour l’instant.'}</p>

        <div className="backup-section">
          <h3>Exporter</h3>
          <p className="note">Télécharge un fichier .zip (données + photos) à ranger dans Fichiers ou iCloud Drive.</p>
          <button className="primary" type="button" disabled={enCours !== null} onClick={handleExport}>
            {enCours === 'export' ? 'Création…' : 'Exporter une sauvegarde'}
          </button>
        </div>

        <div className="backup-section">
          <h3>Restaurer</h3>
          <p className="note">Remplace entièrement les données actuelles par celles d’un fichier .zip exporté depuis l’app.</p>
          <input ref={fileInputRef} className="vh" type="file" accept=".zip" onChange={handleFichierChoisi} />
          <button className="more" type="button" disabled={enCours !== null} onClick={demanderFichier}>
            {enCours === 'import' ? 'Restauration…' : 'Choisir un fichier à restaurer'}
          </button>
        </div>

        {erreur && <p className="note" style={{ color: '#e2887f' }}>{erreur}</p>}
      </div>
    </div>
  )
}
