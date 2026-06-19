import { useCallback, useState } from 'react'
import { getQuizPool } from '../services/db.service'
import { shuffle } from '../lib/helpers'
import type { QuizDrug } from '../lib/types/database.types'

export interface ClinicalCase {
  id: string
  patientAge: number
  conditions: string[]
  currentMeds: string[]
  question: string
  correctDrugId: string
  options: QuizDrug[]
  explanation: string
}

// Seed cases — client-side JSON, no DB table for v1
const SEED_CASES: Omit<ClinicalCase, 'options'>[] = [
  {
    id: 'case-1',
    patientAge: 65,
    conditions: ['Hypertension', 'Asthma'],
    currentMeds: ['Salbutamol'],
    question: 'ผู้ป่วยอายุ 65 ปี มี Hypertension ร่วมกับ Asthma ควรเลือกยาลดความดันกลุ่มใด?',
    correctDrugId: '',
    explanation: 'Beta Blocker ห้ามใช้ใน Asthma เนื่องจากบล็อก β2 → bronchoconstriction ACE Inhibitor หรือ CCB เป็นตัวเลือกที่ปลอดภัยกว่า',
  },
  {
    id: 'case-2',
    patientAge: 45,
    conditions: ['Type 2 DM', 'CKD stage 3'],
    currentMeds: ['Metformin'],
    question: 'ผู้ป่วย DM + CKD stage 3 ต้องพิจารณาปรับยาอะไร?',
    correctDrugId: '',
    explanation: 'Metformin ห้ามใช้เมื่อ eGFR < 30 และต้องลดขนาดเมื่อ eGFR 30-45 เนื่องจากเสี่ยง lactic acidosis',
  },
]

type CasePhase = 'idle' | 'loading' | 'active' | 'result'

export function useClinicalCase() {
  const [phase, setPhase] = useState<CasePhase>('idle')
  const [cases, setCases] = useState<ClinicalCase[]>([])
  const [caseIndex, setCaseIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCases = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const pool = await getQuizPool({ limit: 20 })
      const built: ClinicalCase[] = SEED_CASES.map((seed) => {
        const correct = pool[Math.floor(Math.random() * pool.length)]
        const distractors = shuffle(pool.filter((d) => d.id !== correct.id)).slice(0, 3)
        return {
          ...seed,
          correctDrugId: correct.id,
          options: shuffle([correct, ...distractors]),
        }
      })
      setCases(built)
      setCaseIndex(0)
      setSelected(null)
      setPhase('active')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
      setPhase('idle')
    }
  }, [])

  const selectDrug = useCallback((drugId: string) => {
    setSelected(drugId)
    setPhase('result')
  }, [])

  const nextCase = useCallback(() => {
    const next = caseIndex + 1
    if (next >= cases.length) {
      setPhase('idle')
    } else {
      setCaseIndex(next)
      setSelected(null)
      setPhase('active')
    }
  }, [caseIndex, cases.length])

  const reset = useCallback(() => {
    setPhase('idle')
    setCases([])
    setCaseIndex(0)
    setSelected(null)
  }, [])

  const currentCase = cases[caseIndex] ?? null
  const isCorrect = selected !== null && selected === currentCase?.correctDrugId

  return { phase, currentCase, caseIndex, total: cases.length, selected, isCorrect, error, startCases, selectDrug, nextCase, reset }
}
