type AddButtonProps = {
  onClick: () => void
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button className="add-fab" type="button" onClick={onClick} aria-label="Ajouter un objet">
      +
    </button>
  )
}
