interface TimerBarProps {
  pct: number
  secondsLeft: number
}

export function TimerBar({ pct, secondsLeft }: TimerBarProps) {
  const colorClass =
    pct > 60 ? 'bg-accent' : pct > 30 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="w-full h-1 bg-surface-border rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
      <span className="sr-only">{secondsLeft} วินาที</span>
    </div>
  )
}
