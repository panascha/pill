interface DrugClass {
  id: string
  name: string
}

interface ClassFilterSelectorProps {
  classes: DrugClass[]
  selected: string | undefined
  onChange: (classId: string | undefined) => void
}

export function ClassFilterSelector({ classes, selected, onChange }: ClassFilterSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          !selected ? 'bg-accent text-white border-accent' : 'border-surface-border text-ink-muted hover:border-accent hover:text-accent'
        }`}
      >
        ทั้งหมด
      </button>
      {classes.map((cls) => (
        <button
          key={cls.id}
          onClick={() => onChange(cls.id === selected ? undefined : cls.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            selected === cls.id
              ? 'bg-accent text-white border-accent'
              : 'border-surface-border text-ink-muted hover:border-accent hover:text-accent'
          }`}
        >
          {cls.name}
        </button>
      ))}
    </div>
  )
}
