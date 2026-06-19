import { useCallback, useEffect, useState } from 'react'
import { getDrugDetail } from '../services/db.service'
import type { DrugDetail } from '../lib/types/database.types'

const MAX_COMPARE = 4

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [details, setDetails] = useState<DrugDetail[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedIds.length) { setDetails([]); return }
    setLoading(true)
    Promise.all(selectedIds.map((id) => getDrugDetail(id)))
      .then(setDetails)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedIds])

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }, [])

  const clear = useCallback(() => setSelectedIds([]), [])

  return { selectedIds, details, loading, toggle, clear, maxReached: selectedIds.length >= MAX_COMPARE }
}
