import { Badge } from '../ui/Badge'
import { MarkdownBlock } from '../ui/MarkdownBlock'
import type { DrugDetail } from '../../lib/types/database.types'

interface ComparisonTableProps {
  drugs: DrugDetail[]
}

const FIELDS: { key: keyof DrugDetail; label: string }[] = [
  { key: 'drug_classes', label: 'กลุ่มยา' },
  { key: 'pregnancy_category', label: 'Pregnancy Category' },
  { key: 'mechanism_md', label: 'กลไก' },
  { key: 'indications_md', label: 'ข้อบ่งใช้' },
  { key: 'contraindications_md', label: 'ข้อห้ามใช้' },
  { key: 'dosing_md', label: 'ขนาดยา' },
]

function cellValue(drug: DrugDetail, key: keyof DrugDetail): string {
  if (key === 'drug_classes') return drug.class_name
  const val = drug[key]
  if (val === null || val === undefined) return ''
  return String(val)
}

function valuesMatch(drugs: DrugDetail[], key: keyof DrugDetail): boolean {
  if (drugs.length < 2) return true
  const first = cellValue(drugs[0], key)
  return drugs.every((d) => cellValue(d, key) === first)
}

const MD_KEYS = new Set<keyof DrugDetail>(['mechanism_md', 'indications_md', 'contraindications_md', 'dosing_md'])

export function ComparisonTable({ drugs }: ComparisonTableProps) {
  if (drugs.length < 2) {
    return <p className="text-sm text-ink-muted">เลือกยาอย่างน้อย 2 ตัวเพื่อเปรียบเทียบ</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="min-w-full divide-y divide-surface-border text-sm">
        <thead>
          <tr className="bg-surface-subtle">
            <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted w-32">ฟิลด์</th>
            {drugs.map((d) => (
              <th key={d.id} className="px-4 py-3 text-left text-xs font-semibold text-ink">{d.name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {FIELDS.map(({ key, label }) => {
            const same = valuesMatch(drugs, key)
            return (
              <tr key={key} className={same ? '' : 'bg-warning-light/20'}>
                <td className="px-4 py-3 text-xs text-ink-muted font-medium align-top">{label}</td>
                {drugs.map((d) => {
                  const val = cellValue(d, key)
                  return (
                    <td key={d.id} className={`px-4 py-3 align-top ${!same ? 'font-medium text-ink' : 'text-ink-muted'}`}>
                      {key === 'pregnancy_category' && val ? (
                        <Badge label={val} type="pregnancy" />
                      ) : MD_KEYS.has(key) ? (
                        <MarkdownBlock content={val} />
                      ) : (
                        val || <span className="text-ink-faint">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
