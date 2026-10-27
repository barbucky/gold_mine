import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { creerObjet, modifierObjet, genererInventaire } from '../db/objets'
import { creerSalle } from '../db/salles'
import { importerPhoto } from '../db/photos'
import { useReducedMotion } from '../lib/useReducedMotion'
import { prochainNumeroRomain } from '../lib/romain'
import type { ChampPersonnalise, ValeurChamp } from '../db/types'

/** Représentation « brouillon » d'un champ progression : du/au en texte libre pendant la saisie
 *  (pour ne pas afficher de 0 forcé quand le champ est vide), converti en nombres à l'enregistrement. */
type ValeurProgressionFormulaire = { du: string; au: string; complet: boolean }
type ValeurChampFormulaire = string | ValeurProgressionFormulaire

function estProgressionFormulaire(valeur: ValeurChampFormulaire): valeur is ValeurProgressionFormulaire {
  return typeof valeur === 'object' && 'du' in valeur
}

/** Convertit le brouillon (du/au en texte) en valeurs finales numériques, prêtes pour l'enregistrement. */
function versDetailsFinales(details: Record<string, ValeurChampFormulaire>): Record<string, ValeurChamp> {
  return Object.fromEntries(
    Object.entries(details).map(([nomChamp, valeur]) => [
      nomChamp,
      estProgressionFormulaire(valeur) ? { du: Number(valeur.du) || 1, au: Number(valeur.au) || 1, complet: valeur.complet } : valeur,
    ]),
  )
}

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
  quantite: string
  salleId: number | null
  dateAffichee: string
  anneeCreation: string
  achatMois: string
  achatAnnee: string
  achatAnneeFin: string
  prixAchat: string
  prixRevente: string
  provenance: string
  reference: string
  description: string
  details: Record<string, ValeurChampFormulaire>
}

/** « Circa 1956 » à partir de l'année de création, ou de l'année d'achat à défaut. */
function genererDateAffichee(anneeCreation: string, achatAnnee: string): string {
  const annee = anneeCreation || achatAnnee
  return annee ? `Circa ${annee}` : ''
}

const FORMULAIRE_VIDE: EtatFormulaire = {
  nom: '',
  marque: '',
  quantite: '1',
  salleId: null,
  dateAffichee: '',
  anneeCreation: '',
  achatMois: '',
  achatAnnee: '',
  achatAnneeFin: '',
  prixAchat: '',
  prixRevente: '',
  provenance: '',
  reference: '',
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
  // Tant que la date affichée n'a pas été modifiée à la main, elle suit automatiquement
  // l'année de création (ou d'achat à défaut) — voir genererDateAffichee.
  const [dateAfficheeAuto, setDateAfficheeAuto] = useState(true)
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
    setDateAfficheeAuto(true)
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
    const anneeCreation = objet.anneeCreation?.toString() ?? ''
    const achatAnnee = objet.achatAnnee?.toString() ?? ''
    setForm({
      nom: objet.nom,
      marque: objet.marque,
      quantite: (objet.quantite ?? 1).toString(),
      salleId: objet.salleId,
      dateAffichee: objet.dateAffichee,
      anneeCreation,
      achatMois: objet.achatMois?.toString() ?? '',
      achatAnnee,
      achatAnneeFin: objet.achatAnneeFin?.toString() ?? '',
      prixAchat: (objet.prixAchat / 100).toString(),
      prixRevente: objet.prixRevente != null ? (objet.prixRevente / 100).toString() : '',
      provenance: objet.provenance,
      reference: objet.reference ?? '',
      description: objet.description,
      details: Object.fromEntries(
        Object.entries(objet.details).map(([nomChamp, valeur]) => [
          nomChamp,
          typeof valeur === 'object' ? { du: valeur.du.toString(), au: valeur.au.toString(), complet: valeur.complet } : valeur,
        ]),
      ),
    })
    setPhotoFile(null)
    setSalleDialogOuvert(false)
    setErreur(null)
    setDateAfficheeAuto(objet.dateAffichee === genererDateAffichee(anneeCreation, achatAnnee))
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

  function ajusterQuantite(delta: number) {
    setForm((f) => {
      const actuelle = Math.max(1, Number(f.quantite) || 1)
      return { ...f, quantite: Math.max(1, actuelle + delta).toString() }
    })
  }

  function definirValeurTexte(nomChamp: string, valeur: string) {
    setForm((f) => ({ ...f, details: { ...f.details, [nomChamp]: valeur } }))
  }

  function valeurProgressionDe(nomChamp: string): ValeurProgressionFormulaire {
    const existante = form.details[nomChamp]
    return existante && estProgressionFormulaire(existante) ? existante : { du: '', au: '', complet: false }
  }

  function definirValeurProgression(nomChamp: string, cle: 'du' | 'au' | 'complet', valeur: string | boolean) {
    setForm((f) => {
      const existante = f.details[nomChamp]
      const base = existante && estProgressionFormulaire(existante) ? existante : { du: '', au: '', complet: false }
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
        quantite: form.quantite ? Math.max(1, Number(form.quantite)) : 1,
        dateAffichee: form.dateAffichee.trim(),
        anneeCreation: form.anneeCreation ? Number(form.anneeCreation) : undefined,
        achatMois: form.achatMois ? Number(form.achatMois) : undefined,
        achatAnnee: form.achatAnnee ? Number(form.achatAnnee) : undefined,
        achatAnneeFin: form.achatAnneeFin ? Number(form.achatAnneeFin) : undefined,
        prixAchat: prixAchatCentimes,
        prixRevente: prixReventeCentimes,
        provenance: form.provenance.trim(),
        reference: form.reference.trim() || undefined,
        description: form.description.trim(),
        details: versDetailsFinales(form.details),
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

          <div className="row2">
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
              <label htmlFor="fQuantite">Nombre d&rsquo;exemplaires</label>
              <div className="stepper">
                <input
                  id="fQuantite"
                  type="number"
                  min={1}
                  value={form.quantite}
                  onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
                />
                <button type="button" className="stepper-btn stepper-btn--moins" aria-label="Retirer un exemplaire" onClick={() => ajusterQuantite(-1)}>
                  −
                </button>
                <button type="button" className="stepper-btn stepper-btn--plus" aria-label="Ajouter un exemplaire" onClick={() => ajusterQuantite(1)}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label htmlFor="fDate">Date affichée</label>
              <input
                id="fDate"
                placeholder="Circa 1956"
                value={form.dateAffichee}
                onChange={(e) => {
                  setDateAfficheeAuto(false)
                  setForm((f) => ({ ...f, dateAffichee: e.target.value }))
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="fAnneeCreation">Année de création</label>
              <input
                id="fAnneeCreation"
                type="number"
                value={form.anneeCreation}
                onChange={(e) => {
                  const anneeCreation = e.target.value
                  setForm((f) => ({
                    ...f,
                    anneeCreation,
                    dateAffichee: dateAfficheeAuto ? genererDateAffichee(anneeCreation, f.achatAnnee) : f.dateAffichee,
                  }))
                }}
              />
            </div>
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
              <input
                id="fAnnee"
                type="number"
                value={form.achatAnnee}
                onChange={(e) => {
                  const achatAnnee = e.target.value
                  setForm((f) => ({
                    ...f,
                    achatAnnee,
                    dateAffichee: dateAfficheeAuto ? genererDateAffichee(f.anneeCreation, achatAnnee) : f.dateAffichee,
                  }))
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fAnneeFin">Dernière année d&rsquo;achat (optionnel)</label>
            <input
              id="fAnneeFin"
              type="number"
              value={form.achatAnneeFin}
              onChange={(e) => setForm((f) => ({ ...f, achatAnneeFin: e.target.value }))}
            />
            <p className="note">Si l&rsquo;achat s&rsquo;est étalé sur plusieurs années (ex. série complétée entre 2020 et 2024) : la valeur est répartie entre les deux années dans les statistiques.</p>
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
            <label htmlFor="fReference">Référence</label>
            <input id="fReference" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
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
                <>
                  <div className="row2">
                    <input
                      type="number"
                      placeholder="Du tome n°"
                      aria-label={`${champ.nom} — du tome n°`}
                      value={valeurProgressionDe(champ.nom).du}
                      onChange={(e) => definirValeurProgression(champ.nom, 'du', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Au tome n°"
                      aria-label={`${champ.nom} — au tome n°`}
                      value={valeurProgressionDe(champ.nom).au}
                      onChange={(e) => definirValeurProgression(champ.nom, 'au', e.target.value)}
                    />
                  </div>
                  <label className="switch-row">
                    <span>Série complète</span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={valeurProgressionDe(champ.nom).complet}
                      onChange={(e) => definirValeurProgression(champ.nom, 'complet', e.target.checked)}
                    />
                  </label>
                </>
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
