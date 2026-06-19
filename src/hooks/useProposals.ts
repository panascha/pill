import { useCallback, useEffect, useState } from 'react'
import { getPendingProposals, approveProposal, rejectProposal } from '../services/db.service'
import type { ProposalWithDrug } from '../lib/types/database.types'

export function useProposals() {
  const [proposals, setProposals] = useState<ProposalWithDrug[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProposals(await getPendingProposals())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const approve = useCallback(async (id: string) => {
    await approveProposal(id)
    setProposals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const reject = useCallback(async (id: string) => {
    await rejectProposal(id)
    setProposals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { proposals, loading, error, approve, reject, refresh: fetch }
}
