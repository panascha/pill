import { useEffect, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ClassFilterSelector } from '../components/drug/ClassFilterSelector'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useQuiz } from '../hooks/useQuiz'
import { getDrugClasses } from '../services/db.service'

interface DrugClass { id: string; name: string }

export function QuizPage() {
  const quiz = useQuiz()
  const [classes, setClasses] = useState<DrugClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string | undefined>()

  useEffect(() => {
    getDrugClasses().then(setClasses).catch(() => {})
  }, [])

  if (quiz.phase === 'idle') {
    return (
      <PageShell title="ทำข้อสอบ" subtitle="เลือกกลุ่มยาและเริ่มทำข้อสอบ" maxWidth="md">
        <div className="flex flex-col gap-6">
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
