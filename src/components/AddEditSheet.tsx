import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { creerObjet, modifierObjet, genererInventaire } from '../db/objets'
import { importerPhoto, copierPhotoSouhaitVersObjet } from '../db/photos'
import { obtenirSouhait, supprimerSouhait } from '../db/souhaits'
import { Vitrine } from './Vitrine'
import { ChampMarque } from './ChampMarque'
import { ChampSalle } from './ChampSalle'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { ChampPersonnalise, ValeurChamp } from '../db/types'

/** Représentation « brouillon » d'un champ progression : du/au en texte libre pendant la saisie
 *  (pour ne pas afficher de 0 forcé quand le champ est vide), converti en nombres à l'enregistrement. */
type ValeurProgressionFormulaire = { genre: 'progression'; du: string; au: string; complet: boolean }
/** Brouillon d'une association : `objetId` reste `null` tant que rien n'est choisi dans le sélecteur. */
type ValeurAssociationFormulaire = { genre: 'association'; objetId: number | null }
type ValeurChampFormulaire = string | ValeurProgressionFormulaire | ValeurAssociationFormulaire

function estProgressionFormulaire(valeur: ValeurChampFormulaire): valeur is ValeurProgressionFormulaire {
  return typeof valeur === 'object' && valeur.genre === 'progression'
}

function estAssociationFormulaire(valeur: ValeurChampFormulaire): valeur is ValeurAssociationFormulaire {
  return typeof valeur === 'object' && valeur.genre === 'association'
}

/** Convertit le brouillon (du/au en texte, association éventuellement vide) en valeurs finales
 *  prêtes pour l'enregistrement — une association sans objet choisi n'est pas enregistrée. */
function versDetailsFinales(details: Record<string, ValeurChampFormulaire>): Record<string, ValeurChamp> {
  const resultat: Record<string, ValeurChamp> = {}
  for (const [nomChamp, valeur] of Object.entries(details)) {
    if (estProgressionFormulaire(valeur)) {
      resultat[nomChamp] = { genre: 'progression', du: Number(valeur.du) || 1, au: Number(valeur.au) || 1, complet: valeur.complet }
    } else if (estAssociationFormulaire(valeur)) {
      if (valeur.objetId != null) resultat[nomChamp] = { genre: 'association', objetId: valeur.objetId }
    } else {
      resultat[nomChamp] = valeur
    }
  }
  return resultat
}

export type AddEditSheetHandle = {
  openForNew: (opener: HTMLElement | null) => void
  openForEdit: (objetId: number, opener: HTMLElement | null) => void
  /** Ouvre le formulaire classique prérempli depuis un souhait (wishlist) coché « Acheté ».
   *  Le souhait n'est supprimé qu'à l'enregistrement réel de l'objet — fermer sans enregistrer
   *  laisse le souhait intact. */
  openFromSouhait: (souhaitId: number, opener: HTMLElement | null) => void
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
  const [associationPickerChamp, setAssociationPickerChamp] = useState<string | null>(null)
  const [associationPickerSalleId, setAssociationPickerSalleId] = useState<number | null>(null)
  /** Non nul quand ce formulaire a été ouvert depuis un souhait coché « Acheté » (wishlist) —
   *  à l'enregistrement, le souhait d'origine est supprimé et sa photo reprise sans réimport. */
  const [souhaitOrigineId, setSouhaitOrigineId] = useState<number | null>(null)
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
  const photoInputRef = useRef<HTMLInputElement>(null)

  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const tousObjets = useLiveQuery(() => db.objets.toArray())
  const salleChoisie = salles?.find((s) => s.id === form.salleId)
  const champsSalle: ChampPersonnalise[] = salleChoisie?.champsPersonnalises ?? []
  const salleAssociationPicker = salles?.find((s) => s.id === associationPickerSalleId)
  const objetsAssociationPicker = tousObjets?.filter((o) => o.salleId === associationPickerSalleId && o.id !== objetId) ?? []
  const marquesConnues = useMemo(
    () => [...new Set((tousObjets ?? []).map((o) => o.marque).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
    [tousObjets],
  )

  function reinitialiser() {
    setForm({ ...FORMULAIRE_VIDE, salleId: salles?.[0]?.id ?? null })
    setPhotoFile(null)
    // Un <input type="file"> ne peut pas être « contrôlé » par React : sans ce reset explicite,
    // il garderait visuellement le nom du fichier choisi lors d'un item précédent.
    if (photoInputRef.current) photoInputRef.current.value = ''
    setAssociationPickerChamp(null)
    setSouhaitOrigineId(null)
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

  async function openFromSouhait(souhaitId: number, opener: HTMLElement | null) {
    const souhait = await obtenirSouhait(souhaitId)
    if (!souhait) return
    overlayRef.current?.getAnimations().forEach((a) => a.cancel())
    sheetRef.current?.getAnimations().forEach((a) => a.cancel())
    openerRef.current = opener
    setMode('new')
    setObjetId(null)
    reinitialiser()
    setForm((f) => ({
      ...f,
      nom: souhait.nom,
      marque: souhait.marque,
      salleId: souhait.salleId,
      prixAchat: (souhait.prixAchat / 100).toString(),
    }))
    setSouhaitOrigineId(souhaitId)
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
        Object.entries(objet.details).map(([nomChamp, valeur]) => {
          if (typeof valeur !== 'object') return [nomChamp, valeur]
          if (valeur.genre === 'progression') {
            return [nomChamp, { genre: 'progression', du: valeur.du.toString(), au: valeur.au.toString(), complet: valeur.complet }]
          }
          return [nomChamp, { genre: 'association', objetId: valeur.objetId }]
        }),
      ),
    })
    setPhotoFile(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
    setAssociationPickerChamp(null)
    setSouhaitOrigineId(null)
    setErreur(null)
    setDateAfficheeAuto(objet.dateAffichee === genererDateAffichee(anneeCreation, achatAnnee))
    setVisible(true)
  }

  useImperativeHandle(ref, () => ({ openForNew, openForEdit, openFromSouhait }))

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
      if (associationPickerChamp) {
        setAssociationPickerChamp(null)
      } else {
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, associationPickerChamp])

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
    return existante && estProgressionFormulaire(existante) ? existante : { genre: 'progression', du: '', au: '', complet: false }
  }

  function definirValeurProgression(nomChamp: string, cle: 'du' | 'au' | 'complet', valeur: string | boolean) {
    setForm((f) => {
      const existante = f.details[nomChamp]
      const base = existante && estProgressionFormulaire(existante) ? existante : { genre: 'progression' as const, du: '', au: '', complet: false }
      return { ...f, details: { ...f.details, [nomChamp]: { ...base, [cle]: valeur } } }
    })
  }

  function associationDe(nomChamp: string): ValeurAssociationFormulaire {
    const existante = form.details[nomChamp]
    return existante && estAssociationFormulaire(existante) ? existante : { genre: 'association', objetId: null }
  }

  function choisirAssociation(nomChamp: string, objetId: number) {
    setForm((f) => ({ ...f, details: { ...f.details, [nomChamp]: { genre: 'association', objetId } } }))
    setAssociationPickerChamp(null)
  }

  function ouvrirAssociationPicker(nomChamp: string) {
    const existante = associationDe(nomChamp)
    const objetLie = existante.objetId != null ? tousObjets?.find((o) => o.id === existante.objetId) : undefined
    setAssociationPickerSalleId(objetLie?.salleId ?? null)
    setAssociationPickerChamp(nomChamp)
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
      } else if (souhaitOrigineId && idCible) {
        // Pas de nouveau fichier choisi : on reprend la photo déjà traitée du souhait, sans réimport.
        await copierPhotoSouhaitVersObjet(souhaitOrigineId, idCible)
      }

      if (souhaitOrigineId) {
        await supprimerSouhait(souhaitOrigineId)
        onToast('Objet acheté et ajouté à la collection.')
      } else {
        onToast(mode === 'new' ? 'Objet inventorié.' : 'Objet modifié.')
      }
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
            {souhaitOrigineId ? 'Finaliser l’achat' : mode === 'new' ? 'Inventorier un objet' : "Modifier l'objet"}
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
            <ChampMarque value={form.marque} onChange={(v) => setForm((f) => ({ ...f, marque: v }))} marquesConnues={marquesConnues} />
          </div>

          <div className="row2">
            <ChampSalle value={form.salleId} onChange={(id) => setForm((f) => ({ ...f, salleId: id }))} onToast={onToast} />
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

          {champsSalle.map((champ) => {
            if (champ.type === 'association') {
              const assoc = associationDe(champ.nom)
              const objetChoisi = assoc.objetId != null ? tousObjets?.find((o) => o.id === assoc.objetId) : undefined
              const salleDeLObjetChoisi = objetChoisi ? salles?.find((s) => s.id === objetChoisi.salleId) : undefined
              return (
                <div className="field" key={champ.nom}>
                  <label htmlFor={`fChamp-${champ.nom}`}>{champ.nom}</label>
                  <button id={`fChamp-${champ.nom}`} type="button" className="piece-open assoc-choix" onClick={() => ouvrirAssociationPicker(champ.nom)}>
                    {objetChoisi ? (
                      <>
                        <Vitrine objetId={objetChoisi.id} iconeSalle={salleDeLObjetChoisi?.icone} taille={44} />
                        <span className="piece-info">
                          <span className="piece-nom">{objetChoisi.nom}</span>
                          <span className="note">{objetChoisi.marque}</span>
                        </span>
                      </>
                    ) : (
                      <span className="note">Choisir un objet…</span>
                    )}
                  </button>
                </div>
              )
            }

            return (
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
            )
          })}

          <div className="field">
            <label htmlFor="fPhoto">Photo</label>
            <input
              id="fPhoto"
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {erreur && <p className="note" style={{ color: '#e2887f' }}>{erreur}</p>}

          <button className="primary" type="submit" disabled={enregistrement} style={{ justifySelf: 'center' }}>
            {souhaitOrigineId ? 'Finaliser l’achat' : mode === 'new' ? 'Inventorier' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {associationPickerChamp && (
        <div
          className="mini-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAssociationPickerChamp(null)
          }}
        >
          <div className="mini-dialog mini-dialog--large">
            <h3>{associationPickerChamp}</h3>
            <div className="field">
              <label htmlFor="assocSalle">Collection</label>
              <select
                id="assocSalle"
                value={associationPickerSalleId ?? ''}
                onChange={(e) => setAssociationPickerSalleId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Choisir une collection…</option>
                {salles?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.numero} · {s.nom}
                  </option>
                ))}
              </select>
            </div>

            {associationPickerSalleId != null && (
              <ul className="piece-list assoc-picker-list">
                {objetsAssociationPicker.length === 0 && <p className="note">Aucun objet dans cette collection.</p>}
                {objetsAssociationPicker.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      className="piece-open"
                      onClick={() => choisirAssociation(associationPickerChamp, o.id!)}
                    >
                      <Vitrine objetId={o.id} iconeSalle={salleAssociationPicker?.icone} taille={44} />
                      <span className="piece-info">
                        <span className="piece-nom">{o.nom}</span>
                        <span className="note">{o.marque}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mini-dialog-actions">
              <button className="ghost" type="button" onClick={() => setAssociationPickerChamp(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
