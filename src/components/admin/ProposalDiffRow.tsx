import type { ProposalWithDrug } from '../../lib/types/database.types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface ProposalDiffRowProps {
  proposal: ProposalWithDrug
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

const FIELD_LABELS: Record<string, string> = {
  name: 'ชื่อยา',
  mechanism_md: 'กลไก',
  indications_md: 'ข้อบ่งใช้',
  contraindications_md: 'ข้อห้ามใช้',
  dosing_md: 'ขนาดยา',
  pregnancy_category: 'Pregnancy Category',
  clinical_pearls_md: 'Clinical Pearls',
  brand_names_md: 'ชื่อการค้า',
  pharmacokinetics_md: 'Pharmacokinetics',
  monitoring_md: 'Monitoring',
  drug_interactions_md: 'Drug Interactions',
  special_populations_md: 'Special Populations',
}

export function ProposalDiffRow({ proposal, onApprove, onReject }: ProposalDiffRowProps) {
  const proposed = proposal.proposed_data as Record<string, string>
  const fields = Object.keys(proposed).filter((k) => k !== 'last_updated_by' && k !== 'updated_at')

  return (
    <div className="rounded-xl border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-subtle border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Badge
            label={proposal.action_type}
            type={proposal.action_type === 'ADD' ? 'default' : proposal.action_type === 'EDIT' ? 'severity' : 'default'}
          />
          <span className="font-medium text-sm text-ink">
            {proposal.drugs?.name ?? proposed['name'] ?? 'ยาใหม่'}
          </span>
          <span className="text-xs text-ink-muted">— {proposal.requester_email}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={() => onReject(proposal.id)}>ปฏิเสธ</Button>
          <Button size="sm" onClick={() => onApprove(proposal.id)}>อนุมัติ</Button>
        </div>
      </div>

      <div className="divide-y divide-surface-border">
        {fields.map((field) => (
          <div key={field} className="px-4 py-3 grid grid-cols-[8rem_1fr] gap-4 text-sm">
            <span className="text-xs text-ink-muted font-medium pt-0.5">
              {FIELD_LABELS[field] ?? field}
            </span>
            <span className="text-ink font-medium">{String(proposed[field])}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
