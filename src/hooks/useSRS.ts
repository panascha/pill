import { useCallback } from 'react'

const STORAGE_KEY = 'srs_history'

interface SRSEntry {
  classId: string
  wrong: number
  total: number
  lastSeen: number
  nextDue: number
}

function load(): Record<string, SRSEntry> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(data: Record<string, SRSEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// SM-2 inspired: interval doubles on correct, resets to 1 day on wrong
function nextInterval(entry: SRSEntry, correct: boolean): number {
  const ONE_DAY = 86_400_000
  if (!correct) return ONE_DAY
  const wrongRatio = entry.total > 0 ? entry.wrong / entry.total : 0
  const multiplier = wrongRatio > 0.5 ? 1.5 : 2.5
  const prev = entry.nextDue - entry.lastSeen
  return Math.max(ONE_DAY, Math.round(prev * multiplier))
}

export function useSRS() {
  const recordResult = useCallback((classId: string, correct: boolean) => {
    const data = load()
    const now = Date.now()
    const existing = data[classId] ?? { classId, wrong: 0, total: 0, lastSeen: now, nextDue: now }
    const updated: SRSEntry = {
      ...existing,
      total: existing.total + 1,
      wrong: existing.wrong + (correct ? 0 : 1),
      lastSeen: now,
      nextDue: now + nextInterval(existing, correct),
    }
    data[classId] = updated
    save(data)
  }, [])

  const getWeightedClassIds = useCallback((allClassIds: string[]): string[] => {
    const data = load()
    return [...allClassIds].sort((a, b) => {
      const ea = data[a]
      const eb = data[b]
      const wa = ea ? ea.wrong / Math.max(ea.total, 1) : 0
      const wb = eb ? eb.wrong / Math.max(eb.total, 1) : 0
      return wb - wa
    })
  }, [])

  const getDueClasses = useCallback((): string[] => {
    const data = load()
    const now = Date.now()
    return Object.values(data)
      .filter((e) => e.nextDue <= now)
      .sort((a, b) => a.nextDue - b.nextDue)
      .map((e) => e.classId)
  }, [])

  return { recordResult, getWeightedClassIds, getDueClasses }
}
