import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useClinicalCase } from '../hooks/useClinicalCase'

export function CasesPage() {
  const { phase, currentCase, caseIndex, total, selected, isCorrect, error, startCases, selectDrug, nextCase, reset } = useClinicalCase()

  if (phase === 'idle') {
    return (
      <PageShell title="เคสคลินิก" subtitle="ฝึกการเลือกสั่งใช้ยาจากเคสผู้ป่วยจำลอง" maxWidth="md">
        <div className="flex flex-col gap-4">
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={startCases} className="w-full justify-center py-3">เริ่มทำเคส</Button>
        </div>
      </PageShell>
    )
  }

  if (phase === 'loading') {
    return <PageShell maxWidth="md"><p className="text-ink-muted text-center py-12">กำลังโหลดเคส...</p></PageShell>
  }

  if (!currentCase) return null

  return (
    <PageShell maxWidth="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">เคส {caseIndex + 1} / {total}</span>
          <Button variant="ghost" size="sm" onClick={reset}>ออก</Button>
        </div>

        <Card className="bg-surface-subtle">
          <h2 className="text-sm font-semibold text-ink mb-3">ข้อมูลผู้ป่วย</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="text-ink-muted">อายุ: <span className="text-ink">{currentCase.patientAge} ปี</span></p>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-ink-muted">โรค:</span>
              {currentCase.conditions.map((c) => <Badge key={c} label={c} />)}
            </div>
            {currentCase.currentMeds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-ink-muted">ยาที่ใช้อยู่:</span>
                {currentCase.currentMeds.map((m) => <Badge key={m} label={m} />)}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-base font-medium text-ink leading-relaxed">{currentCase.question}</p>
        </Card>

        <div className="flex flex-col gap-2">
          {currentCase.options.map((drug) => {
            const isSelected = selected === drug.id
            const isAnswered = phase === 'result'
            const correct = drug.id === currentCase.correctDrugId
            let cls = 'border-surface-border bg-surface hover:bg-surface-subtle text-ink'
            if (isAnswered) {
              if (correct) cls = 'border-success bg-success-light text-success font-medium'
              else if (isSelected) cls = 'border-danger bg-danger-light text-danger'
            }
            return (
              <button
                key={drug.id}
                disabled={isAnswered}
                onClick={() => selectDrug(drug.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${cls} disabled:cursor-not-allowed`}
              >
                {drug.name}
              </button>
            )
          })}
        </div>

        {phase === 'result' && (
          <Card className={isCorrect ? 'border-success/40 bg-success-light/20' : 'border-danger/40 bg-danger-light/20'}>
            <p className={`text-sm font-semibold mb-2 ${isCorrect ? 'text-success' : 'text-danger'}`}>
              {isCorrect ? 'ถูกต้อง!' : 'ไม่ถูกต้อง'}
            </p>
            <p className="text-sm text-ink">{currentCase.explanation}</p>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={nextCase}>{caseIndex + 1 < total ? 'เคสถัดไป' : 'จบการฝึก'}</Button>
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}
