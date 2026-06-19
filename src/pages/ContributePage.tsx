import { useEffect, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { submitProposal, searchDrugs } from '../services/db.service'
import type { ProposalActionType } from '../lib/types/database.types'
import { Search } from 'lucide-react'

const MODES: { key: ProposalActionType; label: string }[] = [
  { key: 'ADD', label: 'เพิ่มยาใหม่' },
  { key: 'EDIT', label: 'แก้ไขข้อมูลยา' },
  { key: 'DELETE', label: 'ลบยา' },
]

const FIELDS = [
  { key: 'name', label: 'ชื่อยา (Generic Name)', required: true },
  { key: 'mechanism_md', label: 'กลไกการออกฤทธิ์ (Markdown)', multiline: true },
  { key: 'indications_md', label: 'ข้อบ่งใช้ (Markdown)', required: true, multiline: true },
  { key: 'contraindications_md', label: 'ข้อห้ามใช้ (Markdown)', multiline: true },
  { key: 'dosing_md', label: 'ขนาดยา (Markdown)', multiline: true },
  { key: 'pregnancy_category', label: 'Pregnancy Category (A/B/C/D/X/N)' },
  { key: 'clinical_pearls_md', label: 'Clinical Pearls (Markdown)', multiline: true },
]

interface SearchResult { id: string; name: string; drug_class_id: string | null }

export function ContributePage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<ProposalActionType>('ADD')
  const [targetDrug, setTargetDrug] = useState<SearchResult | null>(null)
  const [drugQuery, setDrugQuery] = useState('')
  const [drugResults, setDrugResults] = useState<SearchResult[]>([])
  const [drugSearching, setDrugSearching] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [deleteReason, setDeleteReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!drugQuery.trim()) { setDrugResults([]); return }
    const t = setTimeout(async () => {
      setDrugSearching(true)
      try { setDrugResults(await searchDrugs(drugQuery)) }
      catch { setDrugResults([]) }
      finally { setDrugSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [drugQuery])

  const reset = () => {
    setForm({})
    setDeleteReason('')
    setTargetDrug(null)
    setDrugQuery('')
    setDrugResults([])
    setSuccess(false)
    setError(null)
  }

  const switchMode = (m: ProposalActionType) => {
    setMode(m)
    reset()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setError('กรุณาเข้าสู่ระบบก่อนส่งข้อมูล'); return }

    if (mode === 'DELETE') {
      if (!targetDrug) { setError('กรุณาเลือกยาที่ต้องการลบ'); return }
      if (!deleteReason.trim()) { setError('กรุณาระบุเหตุผลที่ต้องการลบ'); return }
    }

    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'ADD') {
        const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim()))
        await submitProposal('ADD', null, data, user.email)
      } else if (mode === 'EDIT') {
        if (!targetDrug) throw new Error('กรุณาเลือกยาที่ต้องการแก้ไข')
        const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim()))
        await submitProposal('EDIT', targetDrug.id, data, user.email)
      } else {
        if (!targetDrug) throw new Error('กรุณาเลือกยาที่ต้องการลบ')
        await submitProposal('DELETE', targetDrug.id, { reason: deleteReason.trim() }, user.email)
      }
      setSuccess(true)
      reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="เสนอข้อมูล" subtitle="ข้อมูลที่ส่งจะเข้าสู่ระบบตรวจสอบก่อนอนุมัติ" maxWidth="md">
      {success ? (
        <Card className="text-center py-8">
          <p className="text-base font-medium text-success mb-2">ส่งข้อมูลสำเร็จ!</p>
          <p className="text-sm text-ink-muted mb-4">Admin จะตรวจสอบและอนุมัติในไม่ช้า</p>
          <Button variant="ghost" onClick={reset}>เสนอเพิ่มอีก</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Mode selector */}
          <div className="flex gap-1 bg-surface-subtle rounded-lg p-1">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === key
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Drug search for EDIT/DELETE */}
          {(mode === 'EDIT' || mode === 'DELETE') && (
            <div className="relative">
              {targetDrug ? (
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ink-muted">ยาที่เลือก:</p>
                      <p className="text-sm font-medium text-ink">{targetDrug.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setTargetDrug(null); setDrugQuery(''); setForm({}); setDeleteReason('') }}>
                      เปลี่ยน
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                    <input
                      type="search"
                      placeholder={mode === 'EDIT' ? 'พิมพ์ชื่อยาที่ต้องการแก้ไข...' : 'พิมพ์ชื่อยาที่ต้องการลบ...'}
                      value={drugQuery}
                      onChange={(e) => setDrugQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  {drugSearching && <p className="text-xs text-ink-muted mt-2">กำลังค้นหา...</p>}
                  {drugResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-surface border border-surface-border rounded-xl shadow-lg overflow-hidden">
                      {drugResults.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => { setTargetDrug(d); setDrugQuery(''); setDrugResults([]) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface-subtle transition-colors"
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Form fields for ADD/EDIT */}
          {(mode === 'ADD' || (mode === 'EDIT' && targetDrug)) && (
            <form onSubmit={handleSubmit}>
              <Card>
                <div className="flex flex-col gap-4">
                  {FIELDS.map(({ key, label, required, multiline }) => {
                    // Hide name field in EDIT mode (target drug already selected)
                    if (mode === 'EDIT' && key === 'name') return null
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-ink-muted mb-1.5">
                          {label} {required && <span className="text-danger">*</span>}
                        </label>
                        {multiline ? (
                          <textarea
                            rows={4}
                            value={form[key] ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            required={required && key !== 'name'}
                            className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent font-mono resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={form[key] ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            required={required && key !== 'name'}
                            className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        )}
                      </div>
                    )
                  })}

                  {error && <p className="text-sm text-danger">{error}</p>}

                  <Button type="submit" disabled={submitting || !user} className="justify-center">
                    {submitting ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
                  </Button>
                  {!user && <p className="text-xs text-ink-muted text-center">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</p>}
                </div>
              </Card>
            </form>
          )}

          {/* DELETE reason */}
          {mode === 'DELETE' && targetDrug && (
            <form onSubmit={handleSubmit}>
              <Card>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      เหตุผลที่ต้องการลบ <span className="text-danger">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      required
                      placeholder="ระบุเหตุผล เช่น ยานี้ถูกถอนจากตลาด, ข้อมูลซ้ำซ้อน ฯลฯ"
                      className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                    />
                  </div>

                  {error && <p className="text-sm text-danger">{error}</p>}

                  <Button type="submit" disabled={submitting || !user || !deleteReason.trim()} className="justify-center">
                    {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                  </Button>
                  {!user && <p className="text-xs text-ink-muted text-center">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</p>}
                </div>
              </Card>
            </form>
          )}
        </div>
      )}
    </PageShell>
  )
}