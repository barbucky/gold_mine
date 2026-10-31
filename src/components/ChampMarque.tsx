import { useState } from 'react'

type ChampMarqueProps = {
  value: string
  onChange: (valeur: string) => void
  /** Marques déjà utilisées ailleurs dans l'app, proposées en suggestion. */
  marquesConnues: string[]
  id?: string
}

/** Champ Marque avec autocomplétion maison (le `<datalist>` natif n'affiche pas ses
 *  suggestions sur Safari iOS pour un champ texte — limite connue de WebKit). */
export function ChampMarque({ value, onChange, marquesConnues, id = 'fMarque' }: ChampMarqueProps) {
  const [focus, setFocus] = useState(false)

  const suggestions = marquesConnues
    .filter((m) => m !== value)
    .filter((m) => !value || m.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 6)

  return (
    <div className="field champ-autocomplete">
      <label htmlFor={id}>Marque</label>
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
          {suggestions.map((m) => (
            <li key={m}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(m)
                  setFocus(false)
                }}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
