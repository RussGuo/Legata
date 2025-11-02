import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import type { LegataFile } from '@/types'

type Citation = { fileId: string; page?: number; start: number; end: number }

export default function SourcePreview({ open, onClose, citations, files, colorFor }: {
  open: boolean
  onClose: () => void
  citations: Citation[]
  files: LegataFile[]
  colorFor: (fileId: string) => string
}) {
  const grouped = useMemo(() => {
    const byFile = new Map<string, Citation[]>()
    for (const c of citations) {
      if (!byFile.has(c.fileId)) byFile.set(c.fileId, [])
      byFile.get(c.fileId)!.push(c)
    }
    return Array.from(byFile.entries()).map(([fileId, cites]) => ({ file: files.find(f => f.id === fileId), cites }))
  }, [citations, files])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-[720px] bg-bg-surface border-l border-line shadow-elev-2 flex flex-col">
        <div className="h-12 border-b border-line px-4 flex items-center justify-between">
          <div className="font-medium">Sources</div>
          <button onClick={onClose} className="text-fg-secondary hover:text-accent"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {grouped.length === 0 && <div className="text-small text-fg-secondary">No sources.</div>}
          {grouped.map(({ file, cites }, i) => (
            <div key={i} className="border border-line rounded-md p-3">
              <div className="font-medium mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: colorFor(file?.id || '') }} />
                {file?.name || file?.id || 'Document'}
              </div>
              <div className="text-small whitespace-pre-wrap">
                {renderHighlighted(file?.text || '', cites, colorFor(file?.id || ''))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderHighlighted(text: string, cites: Citation[], color: string) {
  if (!text) return null
  const sorted = cites.slice().sort((a,b)=> a.start - b.start)
  const parts: React.ReactNode[] = []
  let cursor = 0
  for (let i = 0; i < sorted.length; i++) {
    const { start, end } = sorted[i]
    if (start > cursor) parts.push(<span key={`t-${i}-${cursor}`}>{text.slice(cursor, start)}</span>)
    parts.push(
      <mark key={`m-${i}`} style={{ background: hexWithAlpha(color, 0.15), border: `1px solid ${hexWithAlpha(color, 0.4)}` }} className="rounded-sm px-0.5">
        {text.slice(start, end)}
      </mark>
    )
    cursor = end
  }
  if (cursor < text.length) parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>)
  return <>{parts}</>
}

function hexWithAlpha(hex: string, alpha: number) {
  // Accept #RRGGBB
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!m) return hex
  const r = parseInt(m[1],16), g = parseInt(m[2],16), b = parseInt(m[3],16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

