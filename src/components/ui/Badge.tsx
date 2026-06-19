type BadgeVariant = 'severity-mild' | 'severity-moderate' | 'severity-severe' | 'severity-life-threatening'
  | 'freq-very-common' | 'freq-common' | 'freq-uncommon' | 'freq-rare'
  | 'interaction-minor' | 'interaction-moderate' | 'interaction-major' | 'interaction-contraindicated'
  | 'pregnancy' | 'default'

const variantClasses: Record<BadgeVariant, string> = {
  'severity-mild': 'bg-success-light text-success',
  'severity-moderate': 'bg-warning-light text-warning',
  'severity-severe': 'bg-danger-light text-danger',
  'severity-life-threatening': 'bg-danger text-white',
  'freq-very-common': 'bg-danger-light text-danger',
  'freq-common': 'bg-warning-light text-warning',
  'freq-uncommon': 'bg-surface-subtle text-ink-muted',
  'freq-rare': 'bg-surface-subtle text-ink-faint',
  'interaction-minor': 'bg-success-light text-success',
  'interaction-moderate': 'bg-warning-light text-warning',
  'interaction-major': 'bg-danger-light text-danger',
  'interaction-contraindicated': 'bg-danger text-white',
  'pregnancy': 'bg-accent-light text-accent',
  'default': 'bg-surface-subtle text-ink-muted',
}

function severityVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'mild': 'severity-mild',
    'moderate': 'severity-moderate',
    'severe': 'severity-severe',
    'life-threatening': 'severity-life-threatening',
  }
  return map[s] ?? 'default'
}

function frequencyVariant(f: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'very common (>10%)': 'freq-very-common',
    'common (1-10%)': 'freq-common',
    'uncommon (<1%)': 'freq-uncommon',
    'rare': 'freq-rare',
  }
  return map[f] ?? 'default'
}

function interactionVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'minor': 'interaction-minor',
    'moderate': 'interaction-moderate',
    'major': 'interaction-major',
    'contraindicated': 'interaction-contraindicated',
  }
  return map[s] ?? 'default'
}

interface BadgeProps {
  label: string
  type?: 'severity' | 'frequency' | 'interaction' | 'pregnancy' | 'default'
  className?: string
}

export function Badge({ label, type = 'default', className = '' }: BadgeProps) {
  let variant: BadgeVariant = 'default'
  if (type === 'severity') variant = severityVariant(label)
  else if (type === 'frequency') variant = frequencyVariant(label)
  else if (type === 'interaction') variant = interactionVariant(label)
  else if (type === 'pregnancy') variant = 'pregnancy'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  )
}
