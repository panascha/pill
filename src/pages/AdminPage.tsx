import { PageShell } from '../components/layout/PageShell'
import { ProposalDiffRow } from '../components/admin/ProposalDiffRow'
import { Button } from '../components/ui/Button'
import { useProposals } from '../hooks/useProposals'
import { RefreshCw } from 'lucide-react'

export function AdminPage() {
  const { proposals, loading, error, approve, reject, refresh } = useProposals()

  return (
    <PageShell
      title="Admin — Proposals"
      subtitle={`${proposals.length} รายการรอการอนุมัติ`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4" /> รีเฟรช
          </Button>
        </div>

        {loading && <p className="text-sm text-ink-muted text-center py-8">กำลังโหลด...</p>}
        {error && <p className="text-sm text-danger">{error}</p>}

        {!loading && proposals.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-12">ไม่มีรายการรอการอนุมัติ</p>
        )}

        {proposals.map((p) => (
          <ProposalDiffRow
            key={p.id}
            proposal={p}
            onApprove={approve}
            onReject={reject}
          />
        ))}
      </div>
    </PageShell>
  )
}
