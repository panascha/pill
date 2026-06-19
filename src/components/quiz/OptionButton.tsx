interface OptionButtonProps {
  label: string
  onClick: () => void
  state: 'idle' | 'correct' | 'wrong' | 'revealed'
  disabled?: boolean
}

const stateClasses = {
  idle: 'border-surface-border bg-surface hover:bg-surface-subtle hover:border-accent/40 text-ink',
  correct: 'border-success bg-success-light text-success font-medium',
  wrong: 'border-danger bg-danger-light text-danger',
  revealed: 'border-success/50 bg-success-light/50 text-success',
}

export function OptionButton({ label, onClick, state, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${stateClasses[state]} disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  )
}
