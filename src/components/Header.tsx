import type { Floor } from '../data/floors'

type HeaderProps = {
  floor: Floor
  onReplayIntro: () => void
}

export function Header({ floor, onReplayIntro }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">Mc&rsquo;s Gold Mine</div>
      <div className="floor-tag">
        {floor.level} · {floor.name}
      </div>
      <div className="tools">
        <button className="ghost" type="button" onClick={onReplayIntro}>
          Rejouer l&rsquo;intro
        </button>
      </div>
    </header>
  )
}
