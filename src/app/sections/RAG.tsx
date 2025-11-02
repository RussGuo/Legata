import { useEffect, useState } from 'react'
import { FileUp, Send, Copy, BookOpen } from 'lucide-react'
import { LegataFile, Chunk, AnswerSentence } from '@/types'
import { storeFile, listFiles, clearAll, storeChunks, getChunksByFileIds } from '../lib/storage'
import { parseFiles } from '../lib/parse'
import { chunkText } from '../lib/chunk'
import { embedChunks, embedQuery, cosineSimilarities } from '../lib/embed'
import { composeAnswer } from '../lib/retrieve'
import SourcePreview from '../ui/SourcePreview'

export default function RAG({ preloadSamples }: { preloadSamples?: boolean }) {
  const [files, setFiles] = useState<LegataFile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [indexing, setIndexing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<AnswerSentence[] | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const groundedOnly = true

  useEffect(() => {
    listFiles().then(setFiles)
  }, [])

  useEffect(() => {
    (async () => {
      if (!preloadSamples) return
      const existing = await listFiles()
      if (existing.length > 0) return
      const urls = ['/samples/msa_v2.txt', '/samples/nda.txt']
      for (const url of urls) {
        try {
          const res = await fetch(url)
          const text = await res.text()
          const name = url.split('/').pop()!
          await storeFile({ id: crypto.randomUUID(), name, type: 'txt', size: text.length, text, addedAt: Date.now() })
        } catch {}
      }
      setFiles(await listFiles())
    })()
  }, [preloadSamples])

  async function onUpload(input: HTMLInputElement) {
    const fl = input.files
    if (!fl || fl.length === 0) return
    const parsed = await parseFiles(fl)
    for (const f of parsed) await storeFile(f)
    const updated = await listFiles()
    setFiles(updated)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function ensureIndexed() {
    setIndexing(true)
    setProgress(0)
    const selected = files.filter(f => selectedIds.includes(f.id))
    let processed = 0
    const total = selected.length
    for (const f of selected) {
      const chunks: Chunk[] = chunkText(f)
      await storeChunks(chunks)
      processed += 1
      setProgress(Math.round(processed / Math.max(1, total) * 100))
    }
    // Embed all chunks for selected files
    const chunksForSelected = await getChunksByFileIds(selectedIds)
    await embedChunks(chunksForSelected, (p) => setProgress(50 + Math.round(p * 0.5)))
    setIndexing(false)
  }

  async function ask() {
    if (!question.trim() || selectedIds.length === 0) return
    setAnswer(null)
    await ensureIndexed()
    const chunks = await getChunksByFileIds(selectedIds)
    const q = await embedQuery(question)
    const sims = cosineSimilarities(q, chunks)
    const ans = composeAnswer(question, chunks, sims, { groundedOnly })
    setAnswer(ans)
  }

  function copyMarkdown() {
    if (!answer) return
    const lines: string[] = []
    lines.push(`# ${question || 'Answer'}`)
    lines.push('\n## Key Takeaways')
    for (const s of answer.slice(0,3)) {
      const cites = s.citations.map((_, i) => `[${i+1}]`).join('')
      lines.push(`- ${s.text} ${cites}`)
    }
    lines.push('\n## Evidence')
    for (const s of answer) { lines.push(`- ${s.text}`) }
    lines.push('\n## Footnotes')
    let idx = 1
    for (const s of answer) { for (const c of s.citations) { lines.push(`[${idx}] ${c.fileId} ${c.page ? `(p.${c.page})` : ''}`); idx++ } }
    navigator.clipboard.writeText(lines.join('\n'))
  }

  const citePalette = ['bg-cite-a','bg-cite-b','bg-cite-c','bg-cite-d'] as const
  const colorFor = (fileId: string) => {
    const idx = Math.max(0, selectedIds.indexOf(fileId))
    return citePalette[idx % citePalette.length]
  }

  return (
    <div className="mx-auto max-w-container px-6 py-6 grid grid-cols-1 md:grid-cols-[280px_1fr_320px] gap-6">
      <div className="md:col-span-1 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Files</div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <FileUp size={16} />
            <input type="file" multiple className="hidden" onChange={e => onUpload(e.currentTarget)} accept=".pdf,.docx,.txt,.md" />
            <span>Upload</span>
          </label>
        </div>
        <div className="border border-line rounded-md divide-y bg-bg-surface">
          {files.length === 0 && <div className="p-4 text-small text-fg-secondary">No files yet. Upload PDF/DOCX/TXT.</div>}
          {files.map(f => (
            <button
              key={f.id}
              onClick={() => toggleSelect(f.id)}
              onMouseEnter={() => setHoverId(f.id)} onMouseLeave={() => setHoverId(null)}
              className={`relative w-full text-left px-3 py-2.5 hover:bg-white transition grid grid-cols-12 items-center`}
            >
              {selectedIds.includes(f.id) && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />}
              <div className="col-span-7 font-medium text-[13px] truncate">{f.name}</div>
              <div className="col-span-3 justify-self-end"><span className="pill border border-line text-fg-secondary">{f.type.toUpperCase()}</span></div>
              <div className="col-span-2 text-right text-[12px] text-fg-secondary">{f.pages ? `${f.pages}p` : `${(f.size/1024).toFixed(0)}KB`}</div>
              {hoverId === f.id && <HoverPreview file={f} />}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[12px] text-fg-secondary">Scope: {selectedIds.length} docs</div>
        {indexing && (
          <div className="mt-3">
            <div className="text-[12px] text-fg-secondary mb-1">Embedding {progress}%</div>
            <div className="h-[2px] bg-line">
              <div className="h-[2px] bg-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <div className="border border-line rounded-md p-3 mb-3 flex items-center gap-2 bg-bg-surface">
          <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask() }} placeholder="Ask a question (⌘⏎ to send)…" className="flex-1 outline-none" />
          <button onClick={ask} className="px-3 py-2 btn-primary inline-flex items-center gap-2"><Send size={16} /> Ask</button>
        </div>

        <div className="space-y-3 max-w-[72ch]">
          {!answer && <div className="text-small text-fg-secondary">Ask a question to get a grounded answer with citations.</div>}
          {answer && (
            <div className="border border-line rounded-lg p-4 bg-bg-surface">
              <div className="mb-3">
                <div className="text-[13px] text-fg-secondary mb-1">Question</div>
                <h3 className="!text-[1.375rem]">{question || '—'}</h3>
              </div>
              <div className="mb-3">
                <div className="text-[13px] text-fg-secondary mb-1">Key Takeaways</div>
                <ul className="list-disc pl-5">
                  {answer.slice(0,3).map((s, i) => (
                    <li key={i} className="mb-1">
                      {s.text}
                      {s.citations.map((c, j) => (
                        <sup key={j} className="ml-1 text-[11px] align-super">
                          <span className={`inline-block w-2 h-2 rounded-sm mr-1 align-middle ${colorFor(c.fileId)}`} />[{j+1}]
                        </sup>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-3">
                <div className="text-[13px] text-fg-secondary mb-1">Evidence</div>
                {answer.map((s, i) => (
                  <p key={i} className="leading-relaxed mb-2">
                    {s.text}
                    {s.citations.map((c, j) => (
                      <sup key={j} className="ml-1 text-[11px] align-super">
                        <span className={`inline-block w-2 h-2 rounded-sm mr-1 align-middle ${colorFor(c.fileId)}`} />[{j+1}]
                      </sup>
                    ))}
                  </p>
                ))}
              </div>
              <div className="border-t border-line pt-3 mt-3">
                <div className="text-[13px] text-fg-secondary mb-1">Footnotes</div>
                <ol className="pl-4 list-decimal text-small text-fg-secondary">
                  {answer.flatMap(s => s.citations).map((c, idx) => (
                    <li key={idx} className="mb-1">
                      <span className={`inline-block w-2 h-2 rounded-sm mr-2 align-middle ${colorFor(c.fileId)}`} />
                      {c.fileId} {c.page ? `(p.${c.page})` : ''}
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex gap-2">
                  <button onClick={copyMarkdown} className="px-3 py-1 btn-ghost inline-flex items-center gap-2"><Copy size={14}/> Copy as Markdown</button>
                  <button onClick={() => setPreviewOpen(true)} className="px-3 py-1 btn-ghost inline-flex items-center gap-2"><BookOpen size={14}/> Open Sources</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="font-medium mb-2">Context</div>
        <div className="text-small text-fg-secondary border border-line rounded-lg p-3 bg-bg-surface">Top‑k retrieved chunks and controls would appear here.</div>
      </div>

      <SourcePreview open={previewOpen} onClose={() => setPreviewOpen(false)} citations={answer?.flatMap(s => s.citations) || []} files={files} colorFor={(id)=>{
        const idx = Math.max(0, selectedIds.indexOf(id))
        return ['#2F6BFF','#0E9F6E','#7C3AED','#E6A700'][idx % 4]
      }} />
    </div>
  )
}

function HoverPreview({ file }: { file: LegataFile }) {
  const outline = (file.text || '').split(/\n/).filter(l => /^#+\s+|^([0-9]+\.)+\s+/.test(l)).slice(0,2)
  const snippets = (file.text || '').split(/(?<=[.!?])\s+/).slice(0,3)
  return (
    <div className="absolute left-full top-2 ml-2 w-[240px] p-3 rounded-lg bg-bg-surface border border-line shadow-elev-2 text-[12px] text-fg-secondary z-50">
      <div className="font-medium text-fg-primary mb-2">Outline</div>
      <ul className="mb-2 list-disc pl-4">
        {outline.length ? outline.map((o,i)=>(<li key={i} className="truncate">{o.replace(/^#+\s+/,'')}</li>)) : <li className="italic">No headings</li>}
      </ul>
      <div className="font-medium text-fg-primary mb-1">Snippets</div>
      {snippets.map((s,i)=>(<p key={i} className="mb-1 line-clamp-2">{s}</p>))}
    </div>
  )
}
