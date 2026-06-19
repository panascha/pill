import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface DrugCardProps {
  id: string
  name: string
  className_?: string
  pregnancyCategory?: string | null
  selected?: boolean
  onToggleCompare?: (id: string) => void
}

export function DrugCard({ id, name, className_, pregnancyCategory, selected, onToggleCompare }: DrugCardProps) {
  return (
    <Card padding="sm" className={`flex items-center justify-between gap-3 ${selected ? 'ring-2 ring-accent' : ''}`}>
      <div className="min-w-0">
        <Link to={`/drug/${id}`} className="font-medium text-ink hover:text-accent transition-colors truncate block">
          {name}
        </Link>
        {className_ && <p className="text-xs text-ink-muted mt-0.5 truncate">{className_}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {pregnancyCategory && <Badge label={`Cat.${pregnancyCategory}`} type="pregnancy" />}
        {onToggleCompare && (
          <button
            onClick={() => onToggleCompare(id)}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              selected
                ? 'border-accent bg-accent-light text-accent'
                : 'border-surface-border text-ink-muted hover:border-accent hover:text-accent'
            }`}
          >
            {selected ? 'เลิก' : 'เปรียบ'}
          </button>
        )}
      </div>
    </Card>
  )
}
