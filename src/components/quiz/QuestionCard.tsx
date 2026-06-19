import { Flag } from 'lucide-react'
import { Card } from '../ui/Card'
import { TimerBar } from './TimerBar'
import { OptionButton } from './OptionButton'
import { Button } from '../ui/Button'
import type { QuizQuestion } from '../../hooks/useQuiz'

interface QuestionCardProps {
  question: QuizQuestion
  index: number
  total: number
  answer: string | null
  isFlagged: boolean
  timerPct: number
  secondsLeft: number
  onAnswer: (opt: string) => void
  onNext: () => void
  onFlag: () => void
}

export function QuestionCard({
  question, index, total, answer, isFlagged, timerPct, secondsLeft, onAnswer, onNext, onFlag,
}: QuestionCardProps) {
  const answered = answer !== null

  function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'revealed' {
    if (!answered) return 'idle'
    if (opt === question.correct) return answer === opt ? 'correct' : 'revealed'
    if (opt === answer) return 'wrong'
    return 'idle'
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">ข้อ {index + 1} / {total}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${secondsLeft <= 10 ? 'text-danger' : 'text-ink-muted'}`}>
            {secondsLeft}s
          </span>
          <button
            onClick={onFlag}
            className={`p-1 rounded transition-colors ${isFlagged ? 'text-warning' : 'text-ink-faint hover:text-ink-muted'}`}
          >
            <Flag className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <TimerBar pct={timerPct} secondsLeft={secondsLeft} />

      <p className="text-base font-medium text-ink leading-relaxed">{question.question}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <OptionButton
            key={opt}
            label={opt}
            onClick={() => onAnswer(opt)}
            state={optionState(opt)}
            disabled={answered}
          />
        ))}
      </div>

      {answered && (
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} size="sm">
            ถัดไป
          </Button>
        </div>
      )}
    </Card>
  )
}
