import { useState } from 'react'

type ChampAutocompleteProps = {
  label: string
  value: string
  onChange: (valeur: string) => void
  /** Valeurs déjà saisies ailleurs dans l'app pour ce même champ, proposées en suggestion. */
  suggestions: string[]
  id: string
}

/** Champ texte avec autocomplétion maison (le `<datalist>` natif n'affiche pas ses
 *  suggestions sur Safari iOS pour un champ texte — limite connue de WebKit). Utilisé pour
 *  la Marque et pour tout champ personnalisé de type Texte (ex. « Groupe » sur une salle CD). */
export function ChampAutocomplete({ label, value, onChange, suggestions: suggestionsConnues, id }: ChampAutocompleteProps) {
  const [focus, setFocus] = useState(false)

  const suggestions = suggestionsConnues
    .filter((s) => s !== value)
    .filter((s) => !value || s.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 6)

  return (
    <div className="field champ-autocomplete">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
      />
      {focus && suggestions.length > 0 && (
        <ul className="autocomplete-liste">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s)
                  setFocus(false)
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
