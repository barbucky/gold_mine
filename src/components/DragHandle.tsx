import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'

type DragHandleProps = {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
  label: string
  /** Désactive le glisser (ex. une liste filtrée dont l'ordre global n'a pas de sens à modifier). */
  disabled?: boolean
}

/** Poignée de glisser-déposer (réordonnancement) — distincte du reste de la ligne pour que
 *  le geste de glisser ne rentre pas en conflit avec le défilement de la liste ou le tap
 *  d'ouverture de la ligne. */
export function DragHandle({ attributes, listeners, label, disabled }: DragHandleProps) {
  return (
    <button type="button" className="drag-handle" aria-label={label} disabled={disabled} {...attributes} {...listeners}>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx={6} cy={5} r={1.6} fill="currentColor" />
        <circle cx={14} cy={5} r={1.6} fill="currentColor" />
        <circle cx={6} cy={10} r={1.6} fill="currentColor" />
        <circle cx={14} cy={10} r={1.6} fill="currentColor" />
        <circle cx={6} cy={15} r={1.6} fill="currentColor" />
        <circle cx={14} cy={15} r={1.6} fill="currentColor" />
      </svg>
    </button>
  )
}
