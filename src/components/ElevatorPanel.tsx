import { FLOORS } from '../data/floors'

type ElevatorPanelProps = {
  current: number
  disabled: boolean
  onGo: (index: number) => void
}

export function ElevatorPanel({ current, disabled, onGo }: ElevatorPanelProps) {
  return (
    <nav className="panel" aria-label="Étages">
      {FLOORS.map((floor, index) => (
        <button
          key={floor.key}
          className="call"
          type="button"
          aria-current={index === current}
          disabled={disabled}
          onClick={() => onGo(index)}
        >
          <span className="btn">{floor.key}</span>
          {floor.shortName}
        </button>
      ))}
    </nav>
  )
}
