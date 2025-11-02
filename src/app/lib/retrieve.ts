import { AnswerSentence } from '@/types'
import type { Chunk } from '@/types'
import { splitSentences } from './chunk'

export function composeAnswer(question: string, chunks: Chunk[], sims: { chunk: Chunk; score: number }[], opts: { groundedOnly: boolean }): AnswerSentence[] {
  const topk = sims.filter(s => s.score >= 0.25).slice(0, 6)
  const candidateSentences: { text: string; score: number; chunk: Chunk }[] = []
  for (const { chunk, score } of topk) {
    const sents = splitSentences(chunk.text)
    for (const s of sents) {
      const sc = innerScore(question, s)
      candidateSentences.push({ text: s, score: 0.5*score + 0.5*sc, chunk })
    }
  }
  candidateSentences.sort((a,b)=> b.score - a.score)
  const picked: AnswerSentence[] = []
  const used = new Set<string>()
  for (const cand of candidateSentences) {
    const t = cand.text.trim()
    if (t.length < 30) continue
    if (used.has(t)) continue
    used.add(t)
    picked.push({ text: t, citations: [{ fileId: cand.chunk.fileId, start: cand.chunk.start, end: cand.chunk.end }]})
    if (picked.length >= 5) break
  }
  if (picked.length === 0) {
    return [{ text: 'No strong matches found. Try adding documents or rephrasing.', citations: [] }]
  }
  return picked
}

function innerScore(q: string, s: string): number {
  // quick token overlap score
  const qt = tokens(q), st = tokens(s)
  const set = new Set(qt)
  let hit = 0
  for (const t of st) if (set.has(t)) hit++
  return hit / Math.max(1, st.length)
}

function tokens(x: string): string[] {
  return x.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

