import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { creerSouhait, modifierSouhait, obtenirSouhait, supprimerSouhait } from '../db/souhaits'
import { importerPhotoSouhait } from '../db/photos'
import { ChampMarque } from './ChampMarque'
import { ChampSalle } from './ChampSalle'
import { useReducedMotion } from '../lib/useReducedMotion'

export type WishlistSheetHandle = {
  openForNew: (opener: HTMLElement | null) => void
  openForEdit: (souhaitId: number, opener: HTMLElement | null) => void
}

type WishlistSheetProps = {
  onToast: (message: string) => void
}

type EtatFormulaire = {
  nom: string
  marque: string
  salleId: number | null
  prixAchat: string
  visualisation: string
}

const FORMULAIRE_VIDE: EtatFormulaire = {
  nom: '',
  marque: '',
  salleId: null,
  prixAchat: '',
  visualisation: '',
}

export const WishlistSheet = forwardRef<WishlistSheetHandle, WishlistSheetProps>(function WishlistSheet({ onToast }, ref) {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<'new' | 'edit'>('new')
  const [souhaitId, setSouhaitId] = useState<number | null>(null)
  const [form, setForm] = useState<EtatFormulaire>(FORMULAIRE_VIDE)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const reducedMotion = useReducedMotion()

  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const tousObjets = useLiveQuery(() => db.objets.toArray())
  const tousSouhaits = useLiveQuery(() => db.souhaits.toArray())
  const marquesConnues = useMemo(
    () =>
      [...new Set([...(tousObjets ?? []).map((o) => o.marque), ...(tousSouhaits ?? []).map((s) => s.marque)])]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'fr')),
    [tousObjets, tousSouhaits],
  )

  function reinitialiser() {
    setForm(FORMULAIRE_VIDE)
    setPhotoFile(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
    setErreur(null)
  }

  function openForNew(opener: HTMLElement | null) {
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setMode('new')
    setSouhaitId(null)
    reinitialiser()
    setVisible(true)
  }

  async function openForEdit(id: number, opener: HTMLElement | null) {
    const souhait = await obtenirSouhait(id)
    if (!souhait) return
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setMode('edit')
    setSouhaitId(id)
    setForm({
      nom: souhait.nom,
      marque: souhait.marque,
      salleId: souhait.salleId,
      prixAchat: (souhait.prixAchat / 100).toString(),
      visualisation: souhait.visualisation ?? '',
    })
    setPhotoFile(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
    setErreur(null)
    setVisible(true)
  }

  useImperativeHandle(ref, () => ({ openForNew, openForEdit }))

  async function close() {
    if (!visible) return
    if (!reducedMotion) {
      const anims = [
        overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 60, easing: 'ease-in', fill: 'forwards' }),
        sheetRef.current?.animate([{ transform: 'none' }, { transform: 'translateY(50px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }),
      ].filter((a): a is Animation => !!a)
      await Promise.all(anims.map((a) => a.finished)).catch(() => {})
    }
    setVisible(false)
    openerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!visible) return
    closeBtnRef.current?.focus({ preventScroll: true })
    if (reducedMotion) return
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' })
    sheetRef.current?.animate([{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], {
      duration: 460,
      easing: 'cubic-bezier(.2,.8,.25,1)',
    })
  }, [visible, mode, souhaitId, reducedMotion])

  useEffect(() => {
    if (!visible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (enregistrement) return
    if (!form.nom.trim() || !form.salleId || !form.prixAchat) {
      setErreur('Nom, salle et prix d’achat sont obligatoires.')
      return
    }
    setEnregistrement(true)
    setErreur(null)
    try {
      const donnees = {
        nom: form.nom.trim(),
        marque: form.marque.trim(),
        salleId: form.salleId,
        prixAchat: Math.round(parseFloat(form.prixAchat) * 100),
        visualisation: form.visualisation.trim() || undefined,
      }

      let idCible = souhaitId
      if (mode === 'new') {
        idCible = await creerSouhait(donnees)
      } else if (souhaitId) {
        await modifierSouhait(souhaitId, donnees)
      }

      if (photoFile && idCible) {
        await importerPhotoSouhait(idCible, photoFile)
      }

      onToast(mode === 'new' ? 'Souhait ajouté.' : 'Souhait modifié.')
      await close()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible d’enregistrer ce souhait.')
    } finally {
      setEnregistrement(false)
    }
  }

  async function handleSupprimer() {
    if (!souhaitId) return
    if (!window.confirm(`Supprimer « ${form.nom} » de la wishlist ?`)) return
    await supprimerSouhait(souhaitId)
    onToast('Souhait supprimé.')
    await close()
  }

  return (
    <div
      className="sheet-overlay"
      ref={overlayRef}
      hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="formWishlistTitre"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet sheet--wishlist" ref={sheetRef}>
        <div className="sheet-bar">
          <h2 className="d-name" id="formWishlistTitre" style={{ fontSize: 20 }}>
            {mode === 'new' ? 'Ajouter un souhait' : 'Modifier le souhait'}
          </h2>
          <button className="round" type="button" aria-label="Fermer" ref={closeBtnRef} onClick={close}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row2">
            <div className="field">
              <label htmlFor="fWNom">Nom de l&rsquo;objet</label>
              <input id="fWNom" required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
            </div>
            <ChampMarque
              id="fWMarque"
              value={form.marque}
              onChange={(v) => setForm((f) => ({ ...f, marque: v }))}
              marquesConnues={marquesConnues}
            />
          </div>

          <div className="row2">
            <ChampSalle id="fWSalle" value={form.salleId} onChange={(id) => setForm((f) => ({ ...f, salleId: id }))} onToast={onToast} />
            <div className="field">
              <label htmlFor="fWPrix">Prix d&rsquo;achat visé (€)</label>
              <input
                id="fWPrix"
                type="number"
                step="0.01"
                required
                value={form.prixAchat}
                onChange={(e) => setForm((f) => ({ ...f, prixAchat: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fWUrl">Visualisation (lien vers le produit)</label>
            <input
              id="fWUrl"
              type="url"
              placeholder="https://…"
              value={form.visualisation}
              onChange={(e) => setForm((f) => ({ ...f, visualisation: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="fWPhoto">Photo</label>
            <input
              id="fWPhoto"
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {erreur && <p className="note" style={{ color: '#e2887f' }}>{erreur}</p>}

          <button className="primary" type="submit" disabled={enregistrement} style={{ justifySelf: 'center' }}>
            {mode === 'new' ? 'Ajouter à la wishlist' : 'Enregistrer'}
          </button>

          {mode === 'edit' && (
            <button className="ghost" type="button" style={{ justifySelf: 'center', color: '#e2887f' }} onClick={handleSupprimer}>
              Supprimer ce souhait
            </button>
          )}
        </form>
      </div>
    </div>
  )
})
