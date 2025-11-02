import { Chunk, LegataFile } from '@/types'

export function chunkText(file: LegataFile): Chunk[] {
  const text = file.text || ''
  if (!text) return []
  const sentences = splitSentences(text)
  const CHUNK_TOKENS = 900 // approx by characters here
  const OVERLAP = 200
  const chunks: Chunk[] = []
  let current: string[] = []
  let charCount = 0
  let start = 0
  for (const s of sentences) {
    const sLen = s.length
    if (charCount + sLen > CHUNK_TOKENS && current.length > 0) {
      const text = current.join(' ')
      chunks.push({ id: `${file.id}:${start}:${start+text.length}` , fileId: file.id, text, start, end: start + text.length })
      // overlap
      const overlapText = text.slice(-OVERLAP)
      current = overlapText ? [overlapText] : []
      start = start + (text.length - overlapText.length)
      charCount = current.reduce((a, b) => a + b.length, 0)
    }
    if (current.length === 0) start = start
    current.push(s)
    charCount += sLen
  }
  if (current.length) {
    const text = current.join(' ')
    chunks.push({ id: `${file.id}:${start}:${start+text.length}`, fileId: file.id, text, start, end: start + text.length })
  }
  return chunks
}

export function splitSentences(text: string): string[] {
  if ((Intl as any).Segmenter) {
    const seg = new (Intl as any).Segmenter('en', { granularity: 'sentence' })
    return Array.from(seg.segment(text)).map((s: any) => s.segment.trim()).filter(Boolean)
  }
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
}

