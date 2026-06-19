import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ClassFilterSelector } from '../components/drug/ClassFilterSelector'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useQuiz } from '../hooks/useQuiz'
import { useSRS } from '../hooks/useSRS'
import { getDrugClasses } from '../services/db.service'

interface DrugClass { id: string; name: string }

export function QuizPage() {
  const quiz = useQuiz()
  const { getDueClasses, getWeightedClassIds } = useSRS()
  const [classes, setClasses] = useState<DrugClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string | undefined>()

  useEffect(() => {
    getDrugClasses().then(setClasses).catch(() => {})
  }, [])

  const dueClassIds = useMemo(() => getDueClasses(), [getDueClasses, quiz.phase])
  const dueClassNames = useMemo(
    () => dueClassIds.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean) as string[],
    [dueClassIds, classes]
  )
  const weightedIds = useMemo(
    () => classes.length > 0 ? getWeightedClassIds(classes.map((c) => c.id)) : [],
    [getWeightedClassIds, classes]
  )

  if (quiz.phase === 'idle') {
    return (
      <PageShell title="ทำข้อสอบ" subtitle="เลือกกลุ่มยาและเริ่มทำข้อสอบ" maxWidth="md">
        <div className="flex flex-col gap-6">
          {dueClassNames.length > 0 && (
            <Card className="border-accent/30 bg-accent-light/20">
              <h2 className="text-sm font-medium text-accent mb-2">ถึงเวลาทบทวน</h2>
              <div className="flex flex-wrap gap-1.5">
                {dueClassNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedClass(classes.find((c) => c.name === name)?.id)}
                    className="px-2.5 py-1 rounded-lg bg-accent/10 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-2">ระบบแนะนำให้ทบทวนกลุ่มยาเหล่านี้เพื่อการจดจำระยะยาว</p>
            </Card>
          )}

          {weightedIds.length > 0 && dueClassNames.length === 0 && (
            <Card>
              <h2 className="text-sm font-medium text-ink mb-2">กลุ่มที่ควรเน้น</h2>
              <div className="flex flex-wrap gap-1.5">
                {weightedIds.slice(0, 5).map((id) => {
                  const cls = classes.find((c) => c.id === id)
                  return cls ? (
                    <button
                      key={id}
                      onClick={() => setSelectedClass(id)}
                      className="px-2.5 py-1 rounded-lg bg-warning-light text-xs font-medium text-warning hover:bg-warning-light/70 transition-colors"
                    >
                      {cls.name}
                    </button>
                  ) : null
                })}
              </div>
              <p className="text-xs text-ink-muted mt-2">กลุ่มที่คุณตอบผิดบ่อย — แนะนำให้ฝึกเพิ่ม</p>
            </Card>
          )}

          {classes.length > 0 && (
            <Card>
              <h2 className="text-sm font-medium text-ink mb-3">กรองตามกลุ่มยา</h2>
              <ClassFilterSelector classes={classes} selected={selectedClass} onChange={setSelectedClass} />
            </Card>
          )}
          {quiz.error && <p className="text-sm text-danger">{quiz.error}</p>}
          <Button onClick={() => quiz.start({ classId: selectedClass })} className="w-full justify-center py-3">
            เริ่มทำข้อสอบ
          </Button>
        </div>
      </PageShell>
    )
  }

  if (quiz.phase === 'loading') {
    return <PageShell maxWidth="md"><p className="text-ink-muted text-center py-12">กำลังสร้างข้อสอบ...</p></PageShell>
  }

  if (quiz.phase === 'active' && quiz.currentQuestion) {
    return (
      <PageShell maxWidth="md">
        <QuestionCard
          question={quiz.currentQuestion}
          index={quiz.currentIndex}
          total={quiz.total}
          answer={quiz.answers[quiz.currentIndex]}
          isFlagged={quiz.isFlagged}
          timerPct={quiz.timerPct}
          secondsLeft={quiz.secondsLeft}
          onAnswer={quiz.answer}
          onNext={quiz.next}
          onFlag={quiz.flag}
        />
      </PageShell>
    )
  }

  if (quiz.phase === 'review') {
    const flaggedList = Array.from(quiz.flagged)
    return (
      <PageShell title="ตรวจสอบคำตอบ" maxWidth="md">
        <div className="flex flex-col gap-4">
          {flaggedList.length > 0 && (
            <Card className="border-warning/30 bg-warning-light/20">
              <p className="text-sm font-medium text-warning mb-2">คำถามที่ติดธง ({flaggedList.length} ข้อ)</p>
              <div className="flex flex-wrap gap-2">
                {flaggedList.map((i) => (
                  <Badge key={i} label={`ข้อ ${i + 1}`} />
                ))}
              </div>
            </Card>
          )}
          <Button onClick={quiz.finalize} className="w-full justify-center py-3">ดูผลลัพธ์</Button>
        </div>
      </PageShell>
    )
  }

  if (quiz.phase === 'done') {
    const pct = Math.round((quiz.score / quiz.total) * 100)
    return (
      <PageShell title="ผลการสอบ" maxWidth="md">
        <Card className="text-center py-8">
          <p className="text-4xl font-bold text-ink">{quiz.score}<span className="text-xl text-ink-muted">/{quiz.total}</span></p>
          <p className="text-lg text-ink-muted mt-1">{pct}%</p>
          <p className="text-sm text-ink-muted mt-4">
            {pct >= 80 ? 'ยอดเยี่ยม!' : pct >= 60 ? 'ดี ลองอีกครั้ง' : 'ต้องทบทวนเพิ่มเติม'}
          </p>
        </Card>

        <div className="flex flex-col gap-3 mt-4">
          {quiz.questions.map((q, i) => {
            const userAnswer = quiz.answers[i]
            const correct = userAnswer === q.correct
            return (
              <Card key={i} padding="sm" className={correct ? 'border-success/40' : 'border-danger/40'}>
                <p className="text-xs text-ink-muted mb-1">ข้อ {i + 1}</p>
                <p className="text-sm text-ink">{q.question}</p>
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  {!correct && <span className="text-danger">คุณตอบ: {userAnswer || 'หมดเวลา'}</span>}
                  <span className="text-success">เฉลย: {q.correct}</span>
                </div>
              </Card>
            )
          })}
        </div>

        <Button onClick={quiz.reset} variant="ghost" className="w-full justify-center mt-4">ทำใหม่</Button>
      </PageShell>
    )
  }

  return null
}
