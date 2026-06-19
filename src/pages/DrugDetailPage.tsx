import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MarkdownBlock } from '../components/ui/MarkdownBlock'
import { getDrugDetail } from '../services/db.service'
import type { DrugDetail } from '../lib/types/database.types'
import { ArrowLeft } from 'lucide-react'

export function DrugDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [drug, setDrug] = useState<DrugDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDrugDetail(id)
      .then(setDrug)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageShell><p className="text-ink-muted">กำลังโหลด...</p></PageShell>
  if (error || !drug) return <PageShell><p className="text-danger">{error ?? 'ไม่พบยา'}</p></PageShell>

  return (
    <PageShell>
      <div className="flex flex-col gap-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink">{drug.name}</h1>
            {drug.pregnancy_category && <Badge label={drug.pregnancy_category} type="pregnancy" />}
            <Badge label={drug.class_name} />
          </div>
          {drug.brand_names_md && (
            <p className="text-sm text-ink-muted mt-1">
              ชื่อการค้า: <MarkdownBlock content={drug.brand_names_md} className="inline" />
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {drug.mechanism_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">กลไกการออกฤทธิ์</h2>
              <MarkdownBlock content={drug.mechanism_md} />
            </Card>
          )}
          {drug.pharmacokinetics_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">Pharmacokinetics</h2>
              <MarkdownBlock content={drug.pharmacokinetics_md} />
            </Card>
          )}
          {drug.indications_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">ข้อบ่งใช้</h2>
              <MarkdownBlock content={drug.indications_md} />
            </Card>
          )}
          {drug.contraindications_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">ข้อห้ามใช้</h2>
              <MarkdownBlock content={drug.contraindications_md} />
            </Card>
          )}
          {drug.dosing_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">ขนาดยา</h2>
              <MarkdownBlock content={drug.dosing_md} />
            </Card>
          )}
          {drug.monitoring_md && (
            <Card>
              <h2 className="font-semibold text-sm text-ink mb-3">การติดตามการรักษา</h2>
              <MarkdownBlock content={drug.monitoring_md} />
            </Card>
          )}
        </div>

        {drug.side_effects.length > 0 && (
          <Card>
            <h2 className="font-semibold text-sm text-ink mb-4">ผลข้างเคียง</h2>
            <div className="flex flex-col divide-y divide-surface-border">
              {drug.side_effects.map((se, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{se.name}</p>
                    {se.notes_md && <p className="text-xs text-ink-muted mt-0.5">{se.notes_md}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {se.severity && <Badge label={se.severity} type="severity" />}
                    {se.frequency && <Badge label={se.frequency} type="frequency" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {drug.interactions.length > 0 && (
          <Card>
            <h2 className="font-semibold text-sm text-ink mb-4">อันตรกิริยาระหว่างยา</h2>
            <div className="flex flex-col divide-y divide-surface-border">
              {drug.interactions.map((inter, i) => (
                <div key={i} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{inter.drug_name}</p>
                    {inter.mechanism_md && <p className="text-xs text-ink-muted mt-0.5">{inter.mechanism_md}</p>}
                  </div>
                  <Badge label={inter.severity} type="interaction" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {drug.clinical_pearls_md && (
          <Card className="border-accent/30 bg-accent-light/20">
            <h2 className="font-semibold text-sm text-accent mb-3">Clinical Pearls</h2>
            <MarkdownBlock content={drug.clinical_pearls_md} />
          </Card>
        )}

        {drug.special_populations_md && (
          <Card>
            <h2 className="font-semibold text-sm text-ink mb-3">Special Populations</h2>
            <MarkdownBlock content={drug.special_populations_md} />
          </Card>
        )}
      </div>
    </PageShell>
  )
}
