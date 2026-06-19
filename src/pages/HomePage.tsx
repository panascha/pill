import { useEffect, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { DrugCard } from '../components/drug/DrugCard'
import { ComparisonTable } from '../components/drug/ComparisonTable'
import { useComparison } from '../hooks/useComparison'
import { searchDrugs } from '../services/db.service'
import { Search, X } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface SearchResult { id: string; name: string; drug_class_id: string | null }

export function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const { selectedIds, details, loading: comparing, toggle, clear } = useComparison()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchDrugs(query)) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <PageShell title="ค้นหายา" subtitle="ค้นหาจากคลังยาทั้งหมด เลือกหลายตัวเพื่อเปรียบเทียบ">
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="search"
            placeholder="พิมพ์ชื่อยา เช่น Propranolol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.map((d) => (
              <DrugCard
                key={d.id}
                id={d.id}
                name={d.name}
                selected={selectedIds.includes(d.id)}
                onToggleCompare={toggle}
              />
            ))}
          </div>
        )}

        {searching && <p className="text-sm text-ink-muted text-center py-4">กำลังค้นหา...</p>}
        {!searching && query && !results.length && (
          <p className="text-sm text-ink-muted text-center py-4">ไม่พบยาที่ตรงกับ "{query}"</p>
        )}

        {selectedIds.length >= 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">เปรียบเทียบยา ({selectedIds.length} ตัว)</h2>
              <Button variant="ghost" size="sm" onClick={clear}>
                <X className="w-4 h-4" /> ล้าง
              </Button>
            </div>
            {comparing ? (
              <p className="text-sm text-ink-muted">กำลังโหลด...</p>
            ) : (
              <ComparisonTable drugs={details} />
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}
