import type { Chunk } from '@/types'

let pipeline: any | null = null

async function getPipeline() {
  if (pipeline) return pipeline
  const t = await import('@xenova/transformers')
  // @ts-ignore
  pipeline = await (t as any).pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  return pipeline
}

export async function embedChunks(chunks: Chunk[], onProgress?: (p: number) => void) {
  const pipe = await getPipeline()
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i]
    if (!c.embedding) {
      const out = await pipe(c.text, { pooling: 'mean', normalize: true })
      c.embedding = Array.from(out.data as Float32Array)
    }
    if (onProgress) onProgress(Math.round(((i+1)/chunks.length)*100))
  }
}

export async function embedQuery(question: string): Promise<number[]> {
  const pipe = await getPipeline()
  const out = await pipe(question, { pooling: 'mean', normalize: true })
  return Array.from(out.data as Float32Array)
}

export function cosineSimilarities(query: number[], chunks: Chunk[]): { chunk: Chunk; score: number }[] {
  const sims = chunks.filter(c => c.embedding && c.embedding.length).map(c => ({
    chunk: c,
    score: cosine(query, c.embedding!)
  }))
  return sims.sort((a, b) => b.score - a.score)
}

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i] }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8)
}

