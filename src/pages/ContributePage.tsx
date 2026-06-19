import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { submitProposal } from '../services/db.service'

const FIELDS = [
  { key: 'name', label: 'ชื่อยา (Generic Name)', required: true },
  { key: 'mechanism_md', label: 'กลไกการออกฤทธิ์ (Markdown)', multiline: true },
  { key: 'indications_md', label: 'ข้อบ่งใช้ (Markdown)', required: true, multiline: true },
  { key: 'contraindications_md', label: 'ข้อห้ามใช้ (Markdown)', multiline: true },
  { key: 'dosing_md', label: 'ขนาดยา (Markdown)', multiline: true },
  { key: 'pregnancy_category', label: 'Pregnancy Category (A/B/C/D/X/N)' },
  { key: 'clinical_pearls_md', label: 'Clinical Pearls (Markdown)', multiline: true },
]

export function ContributePage() {
  const { user } = useAuth()
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setError('กรุณาเข้าสู่ระบบก่อนส่งข้อมูล'); return }
    setSubmitting(true)
    setError(null)
    try {
      const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim()))
      await submitProposal('ADD', null, data, user.email)
      setSuccess(true)
      setForm({})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="เสนอเพิ่มข้อมูลยา" subtitle="ข้อมูลที่ส่งจะเข้าสู่ระบบตรวจสอบก่อนอนุมัติ" maxWidth="md">
      {success ? (
        <Card className="text-center py-8">
          <p className="text-base font-medium text-success mb-2">ส่งข้อมูลสำเร็จ!</p>
          <p className="text-sm text-ink-muted mb-4">Admin จะตรวจสอบและอนุมัติในไม่ช้า</p>
          <Button variant="ghost" onClick={() => setSuccess(false)}>เสนอเพิ่มอีกตัว</Button>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="flex flex-col gap-4">
              {FIELDS.map(({ key, label, required, multiline }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">
                    {label} {required && <span className="text-danger">*</span>}
                  </label>
                  {multiline ? (
                    <textarea
                      rows={4}
                      value={form[key] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent font-mono resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[key] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={required}
                      className="w-full px-3 py-2 rounded-lg border border-surface-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" disabled={submitting || !user} className="justify-center">
                {submitting ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
              </Button>
              {!user && <p className="text-xs text-ink-muted text-center">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</p>}
            </div>
          </Card>
        </form>
      )}
    </PageShell>
  )
}
