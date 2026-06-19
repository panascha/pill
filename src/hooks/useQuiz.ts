import { useCallback, useEffect, useReducer, useRef } from 'react'
import { getQuizPool } from '../services/db.service'
import { shuffle, frequencyRank, saveQuizResult, truncateMd } from '../lib/helpers'
import { useSRS } from './useSRS'
import type { QuizDrug } from '../lib/types/database.types'

export type QuizPhase = 'idle' | 'loading' | 'active' | 'review' | 'done'
export type QuestionType = 'mechanism' | 'class' | 'side_effect' | 'indication' | 'interaction' | 'pregnancy'

export interface QuizQuestion {
  type: QuestionType
  question: string
  options: string[]
  correct: string
  drugId: string
  drugClassId: string | null
}

interface QuizState {
  phase: QuizPhase
  questions: QuizQuestion[]
  currentIndex: number
  answers: (string | null)[]
  flagged: Set<number>
  secondsLeft: number
  classId: string | undefined
  startedAt: number
  error: string | null
}

type Action =
  | { type: 'START_LOADING'; classId: string | undefined }
  | { type: 'LOADED'; questions: QuizQuestion[] }
  | { type: 'ANSWER'; option: string }
  | { type: 'NEXT' }
  | { type: 'FLAG' }
  | { type: 'TICK' }
  | { type: 'DONE' }
  | { type: 'RESET' }
  | { type: 'ERROR'; message: string }

const SECONDS_PER_QUESTION = 30

/** Sort others: same-class drugs first (Smart Distractor), then rest shuffled */
function priorityOthers(drug: QuizDrug, others: QuizDrug[]): QuizDrug[] {
  const sameClass = others.filter((o) => drug.drug_classes?.id && o.drug_classes?.id === drug.drug_classes.id)
  const diffClass = others.filter((o) => o.drug_classes?.id !== drug.drug_classes?.id)
  return [...shuffle(sameClass), ...shuffle(diffClass)]
}

function buildQuestions(drugs: QuizDrug[]): QuizQuestion[] {
  if (drugs.length < 4) return []
  const questions: QuizQuestion[] = []
  const types: QuestionType[] = ['mechanism', 'class', 'side_effect', 'indication', 'interaction', 'pregnancy']

  for (const drug of drugs) {
    const others = drugs.filter((d) => d.id !== drug.id)
    const type = types[Math.floor(Math.random() * types.length)]
    const q = buildQuestion(drug, others, type)
    if (q) questions.push(q)
  }
  return shuffle(questions)
}

function buildQuestion(drug: QuizDrug, others: QuizDrug[], type: QuestionType): QuizQuestion | null {
  const base = { drugId: drug.id, drugClassId: drug.drug_classes?.id ?? null }

  switch (type) {
    case 'mechanism': {
      const correct = truncateMd(drug.mechanism_md)
      if (!correct) return null
      const distractors = priorityOthers(drug, others).map((d) => truncateMd(d.mechanism_md)).filter(Boolean).slice(0, 3)
      if (distractors.length < 3) return null
      return { ...base, type, question: `ยา ${drug.name} ออกฤทธิ์อย่างไร?`, correct, options: shuffle([correct, ...distractors]) }
    }
    case 'class': {
      const correct = drug.drug_classes?.name
      if (!correct) return null
      const distractors = [...new Set(others.map((d) => d.drug_classes?.name).filter(Boolean) as string[])].filter((c) => c !== correct).slice(0, 3)
      if (distractors.length < 3) return null
      return { ...base, type, question: `ยา ${drug.name} อยู่ในกลุ่มยาใด?`, correct, options: shuffle([correct, ...distractors]) }
    }
    case 'side_effect': {
      const sorted = [...drug.drug_side_effects].sort((a, b) => frequencyRank(b.frequency ?? '') - frequencyRank(a.frequency ?? ''))
      const top = sorted[0]
      if (!top) return null
      const correct = top.side_effects.name
      const ownIds = new Set(drug.drug_side_effects.map((e) => e.side_effects.id))
      const distractors = priorityOthers(drug, others)
        .flatMap((d) => d.drug_side_effects)
        .filter((e) => !ownIds.has(e.side_effects.id))
        .map((e) => e.side_effects.name)
        .slice(0, 3)
      if (distractors.length < 3) return null
      return { ...base, type, question: `ยา ${drug.name} มีผลข้างเคียงใดพบบ่อยที่สุด?`, correct, options: shuffle([correct, ...distractors]) }
    }
    case 'indication': {
      const correct = drug.name
      const distractors = priorityOthers(drug, others).map((d) => d.name).slice(0, 3)
      const keyword = drug.indications_md.split('\n').find((l) => l.trim().startsWith('-'))?.replace(/^-\s*/, '') ?? drug.indications_md.slice(0, 40)
      if (!keyword) return null
      return { ...base, type, question: `ยาใดใช้รักษา "${keyword}"?`, correct, options: shuffle([correct, ...distractors]) }
    }
    case 'interaction': {
      const major = drug.drug_interactions_as_a.filter((i) => i.severity === 'major' || i.severity === 'contraindicated')
      if (!major.length) return null
      const interactingId = major[0].drug_b_id
      const interactingDrug = others.find((d) => d.id === interactingId)
      if (!interactingDrug) return null
      const correct = interactingDrug.name
      const distractors = priorityOthers(drug, others.filter((d) => d.id !== interactingId)).map((d) => d.name).slice(0, 3)
      if (distractors.length < 3) return null
      return { ...base, type, question: `ยา ${drug.name} มีอันตรกิริยารุนแรงกับยาใด?`, correct, options: shuffle([correct, ...distractors]) }
    }
    case 'pregnancy': {
      const correct = drug.pregnancy_category
      if (!correct) return null
      const allCats = ['A', 'B', 'C', 'D', 'X'] as const
      const distractors = shuffle(allCats.filter((c) => c !== correct)).slice(0, 3)
      return { ...base, type, question: `ยา ${drug.name} อยู่ใน FDA Pregnancy Category อะไร?`, correct, options: shuffle([correct, ...distractors]) }
    }
  }
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, phase: 'loading', classId: action.classId, error: null }
    case 'LOADED':
      return {
        ...state,
        phase: 'active',
        questions: action.questions,
        currentIndex: 0,
        answers: new Array(action.questions.length).fill(null),
        flagged: new Set(),
        secondsLeft: SECONDS_PER_QUESTION,
        startedAt: Date.now(),
      }
    case 'ANSWER': {
      if (state.answers[state.currentIndex] !== null) return state
      const answers = [...state.answers]
      answers[state.currentIndex] = action.option
      return { ...state, answers }
    }
    case 'NEXT': {
      const next = state.currentIndex + 1
      if (next >= state.questions.length) return { ...state, phase: 'review' }
      return { ...state, currentIndex: next, secondsLeft: SECONDS_PER_QUESTION }
    }
    case 'FLAG': {
      const flagged = new Set(state.flagged)
      if (flagged.has(state.currentIndex)) flagged.delete(state.currentIndex)
      else flagged.add(state.currentIndex)
      return { ...state, flagged }
    }
    case 'TICK':
      if (state.secondsLeft <= 1) {
        const answers = [...state.answers]
        if (answers[state.currentIndex] === null) answers[state.currentIndex] = ''
        const next = state.currentIndex + 1
        if (next >= state.questions.length) return { ...state, answers, phase: 'review' }
        return { ...state, answers, currentIndex: next, secondsLeft: SECONDS_PER_QUESTION }
      }
      return { ...state, secondsLeft: state.secondsLeft - 1 }
    case 'DONE':
      return { ...state, phase: 'done' }
    case 'RESET':
      return { ...initialState }
    case 'ERROR':
      return { ...state, phase: 'idle', error: action.message }
    default:
      return state
  }
}

const initialState: QuizState = {
  phase: 'idle',
  questions: [],
  currentIndex: 0,
  answers: [],
  flagged: new Set(),
  secondsLeft: SECONDS_PER_QUESTION,
  classId: undefined,
  startedAt: 0,
  error: null,
}

export function useQuiz() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { recordResult, getWeightedClassIds } = useSRS()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.phase === 'active') {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.phase, state.currentIndex])

  const start = useCallback(async (options: { classId?: string; limit?: number } = {}) => {
    dispatch({ type: 'START_LOADING', classId: options.classId })
    try {
      const pool = await getQuizPool(options)
      const questions = buildQuestions(pool)
      if (!questions.length) throw new Error('ไม่มีคำถามเพียงพอ กรุณาเพิ่มข้อมูลยา')
      dispatch({ type: 'LOADED', questions })
    } catch (e) {
      dispatch({ type: 'ERROR', message: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' })
    }
  }, [getWeightedClassIds])

  const answer = useCallback((option: string) => {
    const q = state.questions[state.currentIndex]
    if (!q || state.answers[state.currentIndex] !== null) return
    dispatch({ type: 'ANSWER', option })
    recordResult(q.drugClassId ?? 'unknown', option === q.correct)
  }, [state.questions, state.currentIndex, state.answers, recordResult])

  const next = useCallback(() => dispatch({ type: 'NEXT' }), [])
  const flag = useCallback(() => dispatch({ type: 'FLAG' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const finalize = useCallback(() => {
    const score = state.answers.filter((a, i) => a === state.questions[i]?.correct).length
    saveQuizResult({
      score,
      total: state.questions.length,
      classId: state.classId,
      durationSec: Math.round((Date.now() - state.startedAt) / 1000),
    })
    dispatch({ type: 'DONE' })
  }, [state])

  const score = state.answers.filter((a, i) => a === state.questions[i]?.correct).length
  const currentQuestion = state.questions[state.currentIndex] ?? null
  const isFlagged = state.flagged.has(state.currentIndex)
  const timerPct = (state.secondsLeft / SECONDS_PER_QUESTION) * 100

  return {
    phase: state.phase,
    currentQuestion,
    currentIndex: state.currentIndex,
    total: state.questions.length,
    answers: state.answers,
    questions: state.questions,
    flagged: state.flagged,
    isFlagged,
    secondsLeft: state.secondsLeft,
    timerPct,
    score,
    error: state.error,
    start,
    answer,
    next,
    flag,
    finalize,
    reset,
  }
}
