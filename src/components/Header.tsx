import type { Floor } from '../data/floors'

type HeaderProps = {
  floor: Floor
}

export function Header({ floor }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">Mc&rsquo;s Gold Mine</div>
      <div className="floor-tag">
        {floor.level} · {floor.name}
      </div>
    </header>
  )
}
