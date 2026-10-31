import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { creerSalle, importerIconeSalle } from '../db/salles'
import { prochainNumeroRomain } from '../lib/romain'

type ChampSalleProps = {
  value: number | null
  onChange: (salleId: number) => void
  onToast: (message: string) => void
  id?: string
}

/** Sélecteur de salle avec création de salle à la volée (« + Nouvelle salle… »),
 *  partagé entre le formulaire d'objet et celui de la wishlist. */
export function ChampSalle({ value, onChange, onToast, id = 'fSalle' }: ChampSalleProps) {
  const salles = useLiveQuery(() => db.salles.orderBy('ordre').toArray())
  const [dialogOuvert, setDialogOuvert] = useState(false)
  const [numero, setNumero] = useState('')
  const [nom, setNom] = useState('')
  const [icone, setIcone] = useState<File | null>(null)

  function ouvrirDialog() {
    setNumero(prochainNumeroRomain(salles?.map((s) => s.numero) ?? []))
    setNom('')
    setIcone(null)
    setDialogOuvert(true)
  }

  async function creer() {
    if (!numero.trim() || !nom.trim() || !salles) return
    const nouvelId = await creerSalle({ numero: numero.trim(), nom: nom.trim(), ordre: salles.length, champsPersonnalises: [] })
    if (icone) {
      try {
        await importerIconeSalle(nouvelId, icone)
      } catch (err) {
        onToast(err instanceof Error ? err.message : 'Impossible d’importer cette icône.')
      }
    }
    onChange(nouvelId)
    setDialogOuvert(false)
  }

  return (
    <div className="field">
      <label htmlFor={id}>Salle</label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => {
          if (e.target.value === '__nouvelle__') {
            ouvrirDialog()
          } else {
            onChange(Number(e.target.value))
          }
        }}
      >
        {(!salles || salles.length === 0) && <option value="">Aucune salle pour l&rsquo;instant</option>}
        {salles?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.numero} · {s.nom}
          </option>
        ))}
        <option value="__nouvelle__">+ Nouvelle salle…</option>
      </select>

      {dialogOuvert && (
        <div
          className="mini-dialog-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialogOuvert(false)
          }}
          onKeyDown={(e) => {
            // stopPropagation empêche aussi le Echap global du formulaire parent (AddEditSheet/
            // WishlistSheet, écouté via document.addEventListener) de fermer toute la fiche :
            // seule cette petite boîte de dialogue doit se refermer.
            if (e.key === 'Escape') {
              e.stopPropagation()
              setDialogOuvert(false)
            }
          }}
        >
          <div className="mini-dialog">
            <h3>Nouvelle salle</h3>
            <div className="field">
              <label htmlFor="fSalleNumero">N° de la salle</label>
              <input id="fSalleNumero" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="fSalleNom">Nom de la salle</label>
              <input id="fSalleNom" autoFocus value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="fSalleIcone">Icône (optionnel)</label>
              <input
                id="fSalleIcone"
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                onChange={(e) => setIcone(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="mini-dialog-actions">
              <button className="ghost" type="button" onClick={() => setDialogOuvert(false)}>
                Annuler
              </button>
              <button className="primary" type="button" onClick={creer}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
