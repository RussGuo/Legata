import * as Diff from 'diff'
import type { DiffUnit } from '@/types'

export function detectClauses(text: string): { title: string; body: string }[] {
  const lines = text.split(/\r?\n/)
  const sections: { title: string; body: string }[] = []
  let current: { title: string; body: string } | null = null
  const heading = (s: string) => /^([0-9]+\.)+\s+/.test(s) || /^#+\s+/.test(s) || /^[A-Z0-9 \-]{6,}$/.test(s)
  for (const line of lines) {
    if (heading(line.trim())) {
      if (current) sections.push(current)
      current = { title: line.trim().replace(/^#+\s+/, ''), body: '' }
    } else {
      if (!current) current = { title: 'Preamble', body: '' }
      current.body += (current.body ? '\n' : '') + line
    }
  }
  if (current) sections.push(current)
  return sections
}

export function diffDocs(a: { title: string; body: string }[], b: { title: string; body: string }[], granularity: 'sentence'|'token'): DiffUnit[] {
  const mapA = new Map(a.map(x => [norm(x.title), x]))
  const mapB = new Map(b.map(x => [norm(x.title), x]))
  const titles = Array.from(new Set([...mapA.keys(), ...mapB.keys()]))
  const rows: DiffUnit[] = []
  for (const t of titles) {
    const A = mapA.get(t), B = mapB.get(t)
    if (A && !B) {
      rows.push({ clause: A.title, location: A.title, before: ell(A.body), after: '', type: 'delete', risk: riskNote(A.body) })
    } else if (!A && B) {
      rows.push({ clause: B.title, location: B.title, before: '', after: ell(B.body), type: 'add', risk: riskNote(B.body) })
    } else if (A && B) {
      if (A.body !== B.body) {
        const before = granularity === 'sentence' ? sentenceDiffText(A.body, B.body) : tokenDiffText(A.body, B.body)
        const after = granularity === 'sentence' ? sentenceDiffText(B.body, A.body) : tokenDiffText(B.body, A.body)
        rows.push({ clause: A.title, location: A.title, before, after, type: 'modify', risk: riskNote(B.body) })
      }
    }
  }
  return rows
}

function norm(s: string) { return s.toLowerCase().replace(/\s+/g, ' ').trim() }
function ell(s: string, n = 240) { return s.length > n ? s.slice(0, n) + '…' : s }

function sentenceSplit(s: string): string[] { return s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean) }

function sentenceDiffText(a: string, b: string): string {
  const aa = sentenceSplit(a), bb = sentenceSplit(b)
  const d = Diff.diffArrays(aa, bb)
  return d.map(p => p.removed ? p.value.map(x => `[-${x}-]`).join(' ') : p.added ? p.value.map(x => `{+${x}+}`).join(' ') : p.value.join(' ')).join(' ')
}

function tokenDiffText(a: string, b: string): string {
  const d = Diff.diffWords(a, b)
  return d.map(p => p.removed ? `[-${p.value}-]` : p.added ? `{+${p.value}+}` : p.value).join('')
}

export function exportDiffAsCSV(rows: DiffUnit[]) {
  const header = ['Clause/Location','Before','After','Change Type','Risk Note']
  const esc = (s: string) => '"' + (s || '').replace(/"/g, '""') + '"'
  const lines = [header.join(','), ...rows.map(r => [r.clause, r.before, r.after, r.type, r.risk || ''].map(esc).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  download(blob, 'legata-diff.csv')
}

export function exportDiffAsMarkdown(rows: DiffUnit[]) {
  const lines = ['| Clause | Before | After | Type | Risk |', '|---|---|---|---|---|']
  for (const r of rows) {
    lines.push(`| ${pipe(r.clause)} | ${pipe(r.before)} | ${pipe(r.after)} | ${r.type} | ${pipe(r.risk || '')} |`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' })
  download(blob, 'legata-diff.md')
}

function pipe(s: string) { return (s || '').replace(/\n/g, ' ').replace(/\|/g, '\\|') }

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const RISK_DICT: { pattern: RegExp; note: string }[] = [
  { pattern: /indemnif(y|ication|y and hold harmless)/i, note: 'Broad indemnity; confirm scope & carve‑outs.' },
  { pattern: /liability\s+cap|cap on liability|limitation of liability/i, note: 'Changed cap; check multiples & exclusions.' },
  { pattern: /termination|notice period/i, note: 'Notice/for‑cause terms altered.' },
  { pattern: /jurisdiction|governing law|venue/i, note: 'Venue choice modified.' },
  { pattern: /assignment|ip\s+ownership|intellectual property/i, note: 'Ownership/ licensing terms modified.' },
  { pattern: /confidential/i, note: 'Duration/scope changed.' },
  { pattern: /non-?compete|non-?solicit/i, note: 'Restrictive covenant updated.' },
]

function riskNote(text: string): string | undefined {
  for (const r of RISK_DICT) if (r.pattern.test(text)) return r.note
}

