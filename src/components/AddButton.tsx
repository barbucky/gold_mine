type AddButtonProps = {
  onClick: (opener: HTMLElement) => void
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button className="add-fab" type="button" onClick={(e) => onClick(e.currentTarget)} aria-label="Ajouter un objet">
      +
    </button>
  )
}
