import { useEffect, useState } from 'react'
import { DiffUnit } from '@/types'
import { detectClauses, diffDocs, exportDiffAsCSV, exportDiffAsMarkdown } from '../lib/diff'
import { Pin } from 'lucide-react'

export default function Compare({ preloadSamples }: { preloadSamples?: boolean }) {
  const [textA, setTextA] = useState<string>('')
  const [textB, setTextB] = useState<string>('')
  const [rows, setRows] = useState<DiffUnit[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [granularity, setGranularity] = useState<'sentence'|'token'>('sentence')

  useEffect(() => {
    if (preloadSamples) {
      // Provide tiny placeholder sample for demo
      setTextA(`# 1. Term\nSupplier shall indemnify Client up to $100k.\n\n# 2. Termination\nEither party may terminate with 30 days notice.`)
      setTextB(`# 1. Term\nSupplier shall indemnify and hold harmless Client up to $50k.\n\n# 2. Termination\nEither party may terminate with 10 days notice.`)
    }
  }, [preloadSamples])

  function runDiff() {
    const clausesA = detectClauses(textA)
    const clausesB = detectClauses(textB)
    const diff = diffDocs(clausesA, clausesB, granularity)
    setRows(diff)
  }

  function toggleNote(clause: string) {
    setNotes(prev => ({ ...prev, [clause]: prev[clause] ?? '' }))
  }

  function updateNote(clause: string, v: string) {
    setNotes(prev => ({ ...prev, [clause]: v }))
    localStorage.setItem('legata.notes', JSON.stringify({ ...(JSON.parse(localStorage.getItem('legata.notes')||'{}')), [clause]: v }))
  }

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem('legata.notes')||'{}'); setNotes(s) } catch {}
  }, [])

  return (
    <div className="mx-auto max-w-container px-6 py-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-4">
        <div className="font-medium mb-2">Version A</div>
        <textarea value={textA} onChange={e => setTextA(e.target.value)} className="w-full h-[360px] border border-line rounded-lg p-3 bg-bg-surface font-mono text-sm" placeholder="Paste or upload text for Version A" />
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="font-medium mb-2">Version B</div>
        <textarea value={textB} onChange={e => setTextB(e.target.value)} className="w-full h-[360px] border border-line rounded-lg p-3 bg-bg-surface font-mono text-sm" placeholder="Paste or upload text for Version B" />
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Change Summary</div>
          <div className="flex items-center gap-2 text-sm">
            <select value={granularity} onChange={e => setGranularity(e.target.value as any)} className="field px-2 py-1">
              <option value="sentence">Sentence</option>
              <option value="token">Token</option>
            </select>
            <button onClick={runDiff} className="px-3 py-1 btn-primary">Diff</button>
          </div>
        </div>
        <div className="border border-line rounded-lg bg-bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#FAFBFE] sticky top-0 z-10">
              <tr className="text-left">
                <th className="p-2 border-b border-line font-semibold">Clause</th>
                <th className="p-2 border-b border-line font-semibold">Before</th>
                <th className="p-2 border-b border-line font-semibold">After</th>
                <th className="p-2 border-b border-line font-semibold">Type</th>
                <th className="p-2 border-b border-line font-semibold">Risk</th>
                <th className="p-2 border-b border-line font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-3 text-fg-secondary">Run a diff to see changes.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="p-2 w-40 text-[12px]">{r.clause}</td>
                  <td className="p-2 text-fg-secondary">{renderDiff(r.before)}</td>
                  <td className="p-2 text-fg-secondary">{renderDiff(r.after)}</td>
                  <td className="p-2">
                    <span className={`pill ${r.type==='add'?'pill-add': r.type==='delete'?'pill-del':'pill-mod'}`}>{r.type}</span>
                  </td>
                  <td className="p-2 text-fg-secondary">{r.risk || ''}</td>
                  <td className="p-2 text-right">
                    <button className="text-fg-secondary hover:text-accent inline-flex items-center gap-1" onClick={() => toggleNote(r.clause)}>
                      <Pin size={14}/> Insert Note
                    </button>
                    {notes[r.clause] !== undefined && (
                      <div className="mt-2">
                        <textarea value={notes[r.clause] || ''} onChange={e => updateNote(r.clause, e.target.value)} className="w-full field p-2 text-[12px]" placeholder="Add note (local only)" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="mt-2 flex gap-2 text-sm">
            <button onClick={() => exportDiffAsCSV(rows)} className="px-3 py-1 btn-ghost">Export CSV</button>
            <button onClick={() => exportDiffAsMarkdown(rows)} className="px-3 py-1 btn-ghost">Export Markdown</button>
          </div>
        )}
      </div>
    </div>
  )
}

function renderDiff(input: string) {
  // Convert special markers to styled spans
  const html = input
    .replace(/\{\+([\s\S]+?)\+\}/g, '<span class="diff-add">$1</span>')
    .replace(/\[-([\s\S]+?)-\]/g, '<span class="diff-del">$1</span>')
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
