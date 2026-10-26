import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { creerObjet, modifierObjet, genererInventaire } from '../db/objets'
import { creerSalle } from '../db/salles'
import { importerPhoto } from '../db/photos'
import { useReducedMotion } from '../lib/useReducedMotion'
import { prochainNumeroRomain } from '../lib/romain'
import type { ChampPersonnalise, ValeurChamp } from '../db/types'

export type AddEditSheetHandle = {
  openForNew: (opener: HTMLElement | null) => void
  openForEdit: (objetId: number, opener: HTMLElement | null) => void
}

type AddEditSheetProps = {
  onToast: (message: string) => void
}

type EtatFormulaire = {
  nom: string
  marque: string
  salleId: number | null
  dateAffichee: string
  achatMois: string
  achatAnnee: string
  prixAchat: string
  prixRevente: string
  provenance: string
  description: string
  details: Record<string, ValeurChamp>
}

const FORMULAIRE_VIDE: EtatFormulaire = {
  nom: '',
  marque: '',
  salleId: null,
  dateAffichee: '',
  achatMois: '',
  achatAnnee: '',
  prixAchat: '',
  prixRevente: '',
  provenance: '',
  description: '',
  details: {},
}

export const AddEditSheet = forwardRef<AddEditSheetHandle, AddEditSheetProps>(function AddEditSheet({ onToast }, ref) {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<'new' | 'edit'>('new')
  const [objetId, setObjetId] = useState<number | null>(null)
  const [form, setForm] = useState<EtatFormulaire>(FORMULAIRE_VIDE)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [salleDialogOuvert, setSalleDialogOuvert] = useState(false)
  const [nouvelleSalleNumero, setNouvelleSalleNumero] = useState('')
  const [nouvelleSalleNom, setNouvelleSalleNom] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enregistrement, setEnregistrement] = useState(false)
  const reducedMotion = useReducedMotion()

  const overlayRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const salleChoisie = salles?.find((s) => s.id === form.salleId)
  const champsSalle: ChampPersonnalise[] = salleChoisie?.champsPersonnalises ?? []

  function reinitialiser() {
    setForm({ ...FORMULAIRE_VIDE, salleId: salles?.[0]?.id ?? null })
    setPhotoFile(null)
    setSalleDialogOuvert(false)
    setNouvelleSalleNumero('')
    setNouvelleSalleNom('')
    setErreur(null)
  }

  function openForNew(opener: HTMLElement | null) {
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setMode('new')
    setObjetId(null)
    reinitialiser()
    setVisible(true)
  }

  async function openForEdit(id: number, opener: HTMLElement | null) {
    const objet = await db.objets.get(id)
    if (!objet) return
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setMode('edit')
    setObjetId(id)
    setForm({
      nom: objet.nom,
      marque: objet.marque,
      salleId: objet.salleId,
      dateAffichee: objet.dateAffichee,
      achatMois: objet.achatMois?.toString() ?? '',
      achatAnnee: objet.achatAnnee?.toString() ?? '',
      prixAchat: (objet.prixAchat / 100).toString(),
      prixRevente: objet.prixRevente != null ? (objet.prixRevente / 100).toString() : '',
      provenance: objet.provenance,
      description: objet.description,
      details: objet.details,
    })
    setPhotoFile(null)
    setSalleDialogOuvert(false)
    setErreur(null)
    setVisible(true)
  }

  useImperativeHandle(ref, () => ({ openForNew, openForEdit }))

  async function close() {
    if (!visible) return
    if (!reducedMotion) {
      // Volontairement pas de `.cancel()` ici : l'animation reste figée (fill: forwards) sur l'état
      // disparu jusqu'à la prochaine ouverture (qui l'annule, elle). Sinon un cancel() immédiat après
      // la fin de l'animation fait brièvement réapparaître l'état « avant fondu » avant le hidden.
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
  }, [visible, mode, objetId, reducedMotion])

  useEffect(() => {
    if (!visible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (salleDialogOuvert) {
        setSalleDialogOuvert(false)
      } else {
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, salleDialogOuvert])

  async function creerNouvelleSalle() {
    if (!nouvelleSalleNumero.trim() || !nouvelleSalleNom.trim() || !salles) return
    const id = await creerSalle({ numero: nouvelleSalleNumero.trim(), nom: nouvelleSalleNom.trim(), ordre: salles.length, champsPersonnalises: [] })
    setForm((f) => ({ ...f, salleId: id }))
    setSalleDialogOuvert(false)
    setNouvelleSalleNumero('')
    setNouvelleSalleNom('')
  }

  function definirValeurTexte(nomChamp: string, valeur: string) {
    setForm((f) => ({ ...f, details: { ...f.details, [nomChamp]: valeur } }))
  }

  function definirValeurProgression(nomChamp: string, cle: 'actuel' | 'total', valeur: number) {
    setForm((f) => {
      const existante = f.details[nomChamp]
      const base = typeof existante === 'object' ? existante : { actuel: 0, total: 0 }
      return { ...f, details: { ...f.details, [nomChamp]: { ...base, [cle]: valeur } } }
    })
  }

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
      const anneeInv = form.achatAnnee ? Number(form.achatAnnee) : new Date().getFullYear()
      const prixAchatCentimes = Math.round(parseFloat(form.prixAchat) * 100)
      const prixReventeCentimes = form.prixRevente ? Math.round(parseFloat(form.prixRevente) * 100) : undefined

      const donneesCommunes = {
        salleId: form.salleId,
        nom: form.nom.trim(),
        marque: form.marque.trim(),
        dateAffichee: form.dateAffichee.trim(),
        achatMois: form.achatMois ? Number(form.achatMois) : undefined,
        achatAnnee: form.achatAnnee ? Number(form.achatAnnee) : undefined,
        prixAchat: prixAchatCentimes,
        prixRevente: prixReventeCentimes,
        provenance: form.provenance.trim(),
        description: form.description.trim(),
        details: form.details,
      }

      let idCible = objetId
      if (mode === 'new') {
        const inventaire = await genererInventaire(anneeInv)
        idCible = await creerObjet({ ...donneesCommunes, inventaire, favori: false })
      } else if (objetId) {
        await modifierObjet(objetId, donneesCommunes)
      }

      if (photoFile && idCible) {
        await importerPhoto(idCible, photoFile)
      }

      onToast(mode === 'new' ? 'Objet inventorié.' : 'Objet modifié.')
      await close()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible d’enregistrer cet objet.')
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <div
      className="sheet-overlay"
      ref={overlayRef}
      hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="formTitre"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <div className="sheet-bar">
          <h2 className="d-name" id="formTitre" style={{ fontSize: 20 }}>
            {mode === 'new' ? 'Inventorier un objet' : "Modifier l'objet"}
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
              <label htmlFor="fNom">Nom de l&rsquo;objet</label>
              <input id="fNom" required value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="fMarque">Marque</label>
              <input id="fMarque" value={form.marque} onChange={(e) => setForm((f) => ({ ...f, marque: e.target.value }))} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fSalle">Salle</label>
            <select
              id="fSalle"
              value={form.salleId ?? ''}
              onChange={(e) => {
                if (e.target.value === '__nouvelle__') {
                  setSalleDialogOuvert(true)
                  setNouvelleSalleNumero(prochainNumeroRomain(salles?.map((s) => s.numero) ?? []))
                } else {
                  setForm((f) => ({ ...f, salleId: Number(e.target.value) }))
                }
              }}
            >
              {salles?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.numero} · {s.nom}
                </option>
              ))}
              <option value="__nouvelle__">+ Nouvelle salle…</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="fDate">Date affichée</label>
            <input
              id="fDate"
              placeholder="Circa 1956"
              value={form.dateAffichee}
              onChange={(e) => setForm((f) => ({ ...f, dateAffichee: e.target.value }))}
            />
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="fMois">Mois d&rsquo;achat</label>
              <input
                id="fMois"
                type="number"
                min={1}
                max={12}
                value={form.achatMois}
                onChange={(e) => setForm((f) => ({ ...f, achatMois: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="fAnnee">Année d&rsquo;achat</label>
              <input id="fAnnee" type="number" value={form.achatAnnee} onChange={(e) => setForm((f) => ({ ...f, achatAnnee: e.target.value }))} />
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="fPrixAchat">Prix d&rsquo;achat (€)</label>
              <input
                id="fPrixAchat"
                type="number"
                step="0.01"
                required
                value={form.prixAchat}
                onChange={(e) => setForm((f) => ({ ...f, prixAchat: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="fPrixRevente">Valeur estimée (€)</label>
              <input
                id="fPrixRevente"
                type="number"
                step="0.01"
                value={form.prixRevente}
                onChange={(e) => setForm((f) => ({ ...f, prixRevente: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fProv">Provenance</label>
            <input id="fProv" value={form.provenance} onChange={(e) => setForm((f) => ({ ...f, provenance: e.target.value }))} />
          </div>

          <div className="field">
            <label htmlFor="fNote">Notes</label>
            <textarea id="fNote" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          {champsSalle.map((champ) => (
            <div className="field" key={champ.nom}>
              <label htmlFor={`fChamp-${champ.nom}`}>{champ.nom}</label>
              {champ.type === 'texte' ? (
                <input
                  id={`fChamp-${champ.nom}`}
                  value={typeof form.details[champ.nom] === 'string' ? (form.details[champ.nom] as string) : ''}
                  onChange={(e) => definirValeurTexte(champ.nom, e.target.value)}
                />
              ) : (
                <div className="row2">
                  <input
                    type="number"
                    placeholder="Actuel"
                    aria-label={`${champ.nom} — actuel`}
                    value={typeof form.details[champ.nom] === 'object' ? (form.details[champ.nom] as { actuel: number }).actuel : ''}
                    onChange={(e) => definirValeurProgression(champ.nom, 'actuel', Number(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Total"
                    aria-label={`${champ.nom} — total`}
                    value={typeof form.details[champ.nom] === 'object' ? (form.details[champ.nom] as { total: number }).total : ''}
                    onChange={(e) => definirValeurProgression(champ.nom, 'total', Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="field">
            <label htmlFor="fPhoto">Photo</label>
            <input id="fPhoto" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </div>

          {erreur && <p className="note" style={{ color: '#e2887f' }}>{erreur}</p>}

          <button className="primary" type="submit" disabled={enregistrement} style={{ justifySelf: 'center' }}>
            {mode === 'new' ? 'Inventorier' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {salleDialogOuvert && (
        <div
          className="mini-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSalleDialogOuvert(false)
          }}
        >
          <div className="mini-dialog">
            <h3>Nouvelle salle</h3>
            <div className="field">
              <label htmlFor="fSalleNumero">N° de la salle</label>
              <input id="fSalleNumero" value={nouvelleSalleNumero} onChange={(e) => setNouvelleSalleNumero(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="fSalleNom">Nom de la salle</label>
              <input id="fSalleNom" autoFocus value={nouvelleSalleNom} onChange={(e) => setNouvelleSalleNom(e.target.value)} />
            </div>
            <div className="mini-dialog-actions">
              <button className="ghost" type="button" onClick={() => setSalleDialogOuvert(false)}>
                Annuler
              </button>
              <button className="primary" type="button" onClick={creerNouvelleSalle}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
