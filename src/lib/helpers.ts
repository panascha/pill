import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.use({ breaks: true, gfm: true })

export function renderMd(markdown: string | null | undefined): string {
  if (!markdown) return ''
  const raw = marked.parse(markdown) as string
  return DOMPurify.sanitize(raw)
}

export function truncateMd(markdown: string | null | undefined): string {
  if (!markdown) return ''
  const plain = markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*>]\s+/gm, '')
    .trim()
  const first = plain.split(/[.!?]/)[0]
  return first ? first.trim() : plain.slice(0, 80)
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export type FrequencyKey = 'very common (>10%)' | 'common (1-10%)' | 'uncommon (<1%)' | 'rare'

export function frequencyRank(f: string): number {
  const rank: Record<string, number> = {
    'very common (>10%)': 4,
    'common (1-10%)': 3,
    'uncommon (<1%)': 2,
    'rare': 1,
  }
  return rank[f] ?? 0
}

export interface QuizResult {
  score: number
  total: number
  classId: string | undefined
  durationSec: number
}

export function saveQuizResult(result: QuizResult): void {
  const history: (QuizResult & { timestamp: number })[] = JSON.parse(
    sessionStorage.getItem('quiz_history') ?? '[]'
  )
  history.push({ ...result, timestamp: Date.now() })
  sessionStorage.setItem('quiz_history', JSON.stringify(history))
}
